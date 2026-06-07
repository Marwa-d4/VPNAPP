import { useEffect, useState } from "react";
import { downloadPdf } from "./src/pdfExport.js";
import { tagColors, themes } from "./src/themes.js";

const data = {
  definitions: [
    { term:"VPN (Virtual Private Network)", def:"Technologie créant un tunnel sécurisé à travers un réseau public pour assurer la confidentialité, l'intégrité et l'authentification des données.", emoji:"🔒", tag:"Fondamental" },
    { term:"Tunneling", def:"Mécanisme d'encapsulation d'un paquet réseau à l'intérieur d'un autre paquet pour le transporter via un réseau intermédiaire. Le paquet original est protégé dans une enveloppe sécurisée.", emoji:"🚇", tag:"Fondamental" },
    { term:"Encapsulation", def:"Ajout d'un nouvel en-tête IP autour du paquet original. L'en-tête externe porte les IP publiques des routeurs VPN, le contenu interne est chiffré (ESP ou TLS). À la réception, l'en-tête VPN est supprimée.", emoji:"📦", tag:"Fondamental" },
    { term:"IPsec", def:"Suite de protocoles opérant au niveau 3 (couche réseau). Fournit chiffrement + authentification. Comprend IKEv1/IKEv2 (négociation), AH (intégrité seule) et ESP (chiffrement + intégrité). Deux modes : Transport et Tunnel.", emoji:"🛡️", tag:"Protocole" },
    { term:"IKE (Internet Key Exchange)", def:"Protocole de négociation utilisé par IPsec pour établir une SA (Security Association). IKEv2 = version moderne. Phase 1 : canal sécurisé. Phase 2 : paramètres IPsec.", emoji:"🔑", tag:"Protocole" },
    { term:"AH (Authentication Header)", def:"Protocole IPsec assurant uniquement l'intégrité et l'authentification. NE chiffre PAS les données. Incompatible avec NAT car il signe l'en-tête IP.", emoji:"✅", tag:"Protocole" },
    { term:"ESP (Encapsulating Security Payload)", def:"Protocole IPsec assurant chiffrement + intégrité + authentification. Protocole le plus utilisé en pratique. Compatible avec NAT-T.", emoji:"🔐", tag:"Protocole" },
    { term:"Mode Transport vs Mode Tunnel (IPsec)", def:"Mode Transport : chiffre uniquement le payload, conserve l'en-tête IP original → utilisé entre deux hôtes. Mode Tunnel : encapsule tout le paquet IP dans un nouveau paquet → utilisé pour VPN site-to-site.", emoji:"↔️", tag:"Protocole" },
    { term:"TLS/SSL", def:"Protocole de sécurité opérant au niveau 4-7. Utilisé pour VPN SSL. Handshake : Client Hello → Server Hello → échange certificats → génération clés de session → chiffrement symétrique.", emoji:"🤝", tag:"Protocole" },
    { term:"OpenVPN", def:"Solution VPN open-source basée sur TLS. Fonctionne en TCP ou UDP (port 1194). Architecture client-serveur. Utilise une PKI pour les certificats.", emoji:"🌐", tag:"Protocole" },
    { term:"WireGuard", def:"Protocole VPN moderne avec code minimaliste. Cryptographie moderne (Curve25519, ChaCha20). Performances très élevées. Plus simple à configurer qu'IPsec.", emoji:"⚡", tag:"Protocole" },
    { term:"PPTP", def:"Protocole obsolète. Simple mais avec de graves vulnérabilités cryptographiques. À NE PLUS UTILISER.", emoji:"❌", tag:"Protocole" },
    { term:"L2TP", def:"Layer 2 Tunneling Protocol. NE fournit PAS de chiffrement natif. Toujours utilisé avec IPsec → L2TP/IPsec.", emoji:"⚠️", tag:"Protocole" },
    { term:"PKI (Public Key Infrastructure)", def:"Infrastructure de gestion des clés et certificats numériques. Génération de certificats, validation d'identité, gestion des révocations (CRL). Garantit la confiance dans le système VPN.", emoji:"🏛️", tag:"Sécurité" },
    { term:"PFS (Perfect Forward Secrecy)", def:"Garantit que la compromission d'une clé de session ne permet pas de déchiffrer les sessions passées. Implémenté via ECDHE ou DH éphémère. Sans PFS : une clé volée = toutes les sessions compromises.", emoji:"⏪", tag:"Sécurité" },
    { term:"MFA (Multi-Factor Authentication)", def:"Authentification combinant : ce qu'on sait (MDP), ce qu'on possède (token), ce qu'on est (biométrie). Recommandé pour tous les accès VPN distants sensibles.", emoji:"🔏", tag:"Sécurité" },
    { term:"Split Tunneling vs Full Tunneling", def:"Full Tunneling : TOUT le trafic passe par le VPN → sécurité max mais lent. Split Tunneling : seul le trafic interne est chiffré → meilleures performances mais risque accru.", emoji:"🍴", tag:"Architecture" },
    { term:"VPN Site-to-Site", def:"Interconnexion de deux réseaux distants. Le tunnel est établi entre les routeurs/pare-feux, pas entre les utilisateurs. Transparent pour les utilisateurs finaux.", emoji:"🏢", tag:"Architecture" },
    { term:"VPN Remote Access", def:"Connexion d'un utilisateur distant au réseau interne. Un client VPN est installé sur le poste. Le tunnel s'établit entre le client et le serveur VPN.", emoji:"🏠", tag:"Architecture" },
    { term:"Architecture Centralisée", def:"Un site central (hub), tous les sites distants y convergent. Avantage : administration simple. Inconvénient : point unique de défaillance (SPOF).", emoji:"🕸️", tag:"Architecture" },
    { term:"Architecture Maillée", def:"Chaque site peut établir un tunnel directement avec les autres. Avantage : haute disponibilité. Inconvénient : complexité de gestion élevée.", emoji:"🔗", tag:"Architecture" },
    { term:"NAT-T (NAT Traversal)", def:"Mécanisme permettant à IPsec ESP de traverser un NAT. Encapsule ESP dans UDP port 4500. Nécessaire car le NAT modifie les en-têtes IP que AH signe.", emoji:"🔀", tag:"Protocole" },
    { term:"SA (Security Association)", def:"Ensemble de paramètres (algorithmes, clés, durée de vie) convenus entre deux pairs pour sécuriser la communication. Établie par IKE. Une SA est unidirectionnelle.", emoji:"🤜", tag:"Protocole" },
    { term:"Crypto Map (Cisco)", def:"Objet de configuration Cisco liant ensemble : le trafic intéressant (ACL), le peer IPsec, le transform-set, et les paramètres IKE. Appliqué sur l'interface de sortie du routeur.", emoji:"🗺️", tag:"Outil" },
    { term:"Transform-Set (Cisco)", def:"Combinaison d'algorithmes de sécurité utilisée par IPsec. Ex : esp-3des esp-sha-hmac. Définit comment le trafic VPN sera chiffré et authentifié entre les peers.", emoji:"⚙️", tag:"Outil" },
    { term:"ACL Trafic Intéressant", def:"Liste de contrôle d'accès définissant quel trafic doit déclencher le tunnel IPsec. Ex Cisco : access-list 110 permit ip 192.168.1.0 0.0.0.255 192.168.3.0 0.0.0.255", emoji:"📋", tag:"Outil" },
    { term:"Routage Statique", def:"Routes configurées manuellement par l'administrateur. Simple, contrôle total, faible consommation. Non scalable, pas d'adaptation automatique. Recommandé : petits réseaux stables.", emoji:"📍", tag:"Architecture" },
    { term:"OSPF (Open Shortest Path First)", def:"Protocole de routage dynamique Link State. Métrique = coût (bande passante). Convergence rapide. Aucune limite de sauts. Recommandé pour les grands réseaux.", emoji:"🗺️", tag:"Protocole" },
    { term:"RIP (Routing Information Protocol)", def:"Protocole de routage dynamique Distance Vector. Métrique = nombre de sauts. Convergence lente. Limite : 15 sauts max. Recommandé uniquement pour petits réseaux.", emoji:"📡", tag:"Protocole" },
    { term:"StrongSwan", def:"Solution IPsec open-source pour Linux. Fichier de config : /etc/ipsec.conf. Supporte IKEv1 et IKEv2. Utilisé pour tunnels site-to-site entre routeurs Ubuntu.", emoji:"💪", tag:"Outil" },
  ],
  scenarios: [
    { id:1, titre:"Le télétravailleur sous attaque", contexte:"Sarah se connecte depuis un café Wi-Fi public au VPN de son entreprise. Un attaquant sur le même réseau tente un sniffing et un MITM.", question:"Quels mécanismes VPN protègent Sarah ? Qu'est-ce qui se passe exactement sur le réseau ?",
      corrige:{ points:["Le client VPN chiffre tout le trafic (AES-256-GCM avec ESP) → le sniffeur ne voit que du texte chiffré.","L'authentification par certificat empêche l'attaquant de se faire passer pour le serveur VPN → protection MITM via PKI.","Si PFS est activé (ECDHE) : même si l'attaquant enregistre le trafic, il ne pourra pas le déchiffrer plus tard.","Full Tunneling recommandé : tout le trafic de Sarah passe par le VPN → zéro fuite possible."], piege:"Sans MFA et avec un PSK faible, une attaque dictionnaire pourrait compromettre l'accès. Sans PFS, les sessions enregistrées pourraient être déchiffrées a posteriori." }},
    { id:2, titre:"Interconnexion de deux agences", contexte:"Siège à Rabat (192.168.1.0/24) et agence à Casablanca (192.168.2.0/24). Communication sécurisée via Internet requise.", question:"Quel type de VPN ? Quel protocole ? Décrivez l'architecture.",
      corrige:{ points:["Type : VPN Site-to-Site. Tunnel entre routeurs/pare-feux VPN, pas entre utilisateurs.","Protocole : IPsec (ESP + IKEv2). Mode Tunnel → encapsule tout le paquet IP.","Configuration Cisco : crypto isakmp policy + crypto map VPN-MAP sur l'interface Serial.","Trafic intéressant : ACL permit ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255","Les utilisateurs n'ont pas de client VPN → transparent pour eux."], piege:"Oublier les routes de retour ou confondre les sens de l'ACL sur chaque routeur." }},
    { id:3, titre:"Incident de sécurité VPN", contexte:"500 tentatives de connexion VPN échouées en 10 minutes depuis une IP étrangère, suivies d'une connexion réussie depuis un pays inhabituel.", question:"Comment analyser et répondre à cet incident ?",
      corrige:{ points:["Identifier : attaque brute force réussie.","Isoler : désactiver le compte + couper le tunnel actif.","Analyser logs : quelle ressource accédée ? Données exfiltrées ?","Révoquer : certificat → CRL. PSK → changer la clé.","Corriger : MFA obligatoire, fail2ban, géo-blocage.","Post-incident : audit général + formation utilisateurs."], piege:"Les 500 tentatives auraient dû déclencher une alerte AVANT → absence de politique de lockout = faille critique." }},
    { id:4, titre:"Choix du protocole VPN", contexte:"Startup : VPN pour 50 télétravailleurs. Critères : facile à maintenir, performances élevées, sécurité maximale, compatible Linux/Windows/macOS.", question:"Quel(s) protocole(s) recommandez-vous ?",
      corrige:{ points:["WireGuard : moderne, perf excellentes, code simple (moins de surface d'attaque), crypto de pointe.","OpenVPN : éprouvé, très compatible, basé sur TLS, supporte TCP/UDP port 1194.","À ÉVITER : PPTP (vulnérabilités critiques), L2TP seul (pas de chiffrement).","Choix final : WireGuard si équipe compétente, OpenVPN sinon pour sa maturité."], piege:"Ne pas confondre sécurité = complexité. WireGuard est plus simple ET plus sécurisé qu'IPsec dans ce cas." }},
    { id:5, titre:"Diagnostic tunnel VPN en panne", contexte:"VPN OpenVPN déployé. Clients connectés (IP VPN attribuée) mais ne peuvent pas accéder aux ressources internes (192.168.10.0/24). Ping → timeout.", question:"Diagnostiquez et proposez les vérifications.",
      corrige:{ points:["Route côté serveur : ip route show → route vers 192.168.10.0/24 présente ?","Route retour (cause #1) : le réseau interne a-t-il une route vers 10.8.0.0/24 ?","Pare-feu : règles iptables bloquent-elles entre interface VPN et LAN ?","push route OpenVPN : vérifier push 'route 192.168.10.0 255.255.255.0' dans server.conf.","NAT masquerading si pas de route retour possible."], piege:"Cause la plus fréquente : ROUTE RETOUR manquante. Le serveur répond mais le réseau interne ne sait pas comment joindre 10.8.0.x." }},
    { id:6, titre:"Audit de configuration IPsec Cisco", contexte:"Config IPsec en production : DES + MD5 + mode Agressif IKEv1 + PSK 8 caractères + pas de PFS.", question:"Identifiez toutes les failles et proposez une config sécurisée.",
      corrige:{ points:["DES → CRITIQUE : 56 bits, cassable en quelques heures → AES-256-GCM.","MD5 → GRAVE : compromis → SHA-256 ou SHA-384.","Mode Agressif IKEv1 → GRAVE : expose le hash PSK en clair → Main Mode ou IKEv2.","PSK 8 caractères → GRAVE : brute-force facile → certificats X.509 ou PSK 20+ chars aléatoires.","Pas de PFS → SÉRIEUX : activer ECDH group 19 (ECDHE).","Config recommandée : IKEv2 + AES-256-GCM + SHA-384 + ECDHE(19) + PKI."], piege:"Chaque faille est cumulable. La sécurité est une chaîne, le maillon le plus faible définit le niveau." }},
  ],
  topologies: [
    {
      id: "cisco-ipsec",
      titre: "VPN IPsec Site-à-Site Cisco (Packet Tracer)",
      description: "Topologie issue du TP Cisco. R1 (LAN 192.168.1.0/24) ↔ R2 (transit) ↔ R3 (LAN 192.168.3.0/24). Tunnel IPsec ESP entre R1 et R3 via R2.",
      questions: [
        { q:"Sur quelle interface de R1 applique-t-on la crypto map ?", r:"Sur l'interface Serial S0/0/0 (interface de sortie WAN vers Internet/R2). Commande : interface S0/0/0 → crypto map VPN-MAP" },
        { q:"Pourquoi R2 ne connaît pas le VPN ?", r:"R2 est un routeur de transit (ISP). Il voit uniquement les paquets ESP chiffrés avec les IP publiques. Le tunnel IPsec est transparent pour lui, il ne fait que forwarder les paquets." },
        { q:"Que contient l'ACL 110 sur R1 ?", r:"access-list 110 permit ip 192.168.1.0 0.0.0.255 192.168.3.0 0.0.0.255 → définit le 'trafic intéressant' qui déclenche le chiffrement IPsec (PC-A vers PC-C)." },
        { q:"Que signifie #pkts encaps: 0 dans show crypto ipsec sa ?", r:"Le tunnel est configuré mais aucun trafic intéressant n'a encore circulé. Dès qu'un ping PC-A → PC-C est envoyé, les compteurs passent à >0, prouvant que le tunnel fonctionne." },
        { q:"Pourquoi un ping PC-B → PC-A ne chiffre pas le trafic ?", r:"PC-B (192.168.2.0/24) vers PC-A n'est pas couvert par l'ACL 110 qui définit uniquement le trafic 192.168.1.0/24 ↔ 192.168.3.0/24. Ce trafic reste non chiffré." },
        { q:"Quelle est la différence entre Phase 1 et Phase 2 IKE dans ce TP ?", r:"Phase 1 (ISAKMP) : établit un canal sécurisé pour négocier. Params : AES, SHA-1, DH groupe 2, PSK 'cisco', durée 86400s. Phase 2 (IPsec) : négocie les paramètres du tunnel réel. Transform-set VPN-SET = esp-3des + esp-sha-hmac." },
      ]
    },
    {
      id: "strongswan",
      titre: "Tunnel IPsec StrongSwan (Ubuntu Linux)",
      description: "Deux routeurs Ubuntu interconnectés via WAN (10.0.0.0/24). Router1 protège LAN 192.168.1.0/24, Router2 protège LAN 192.168.2.0/24. Tunnel IKEv2 avec PSK.",
      questions: [
        { q:"Que configure-t-on dans /etc/ipsec.conf sur Router1 ?", r:"left=10.0.0.1 (IP WAN locale), leftsubnet=192.168.1.0/24 (LAN à protéger), right=10.0.0.2 (peer), rightsubnet=192.168.2.0/24 (LAN distant), keyexchange=ikev2, auto=start." },
        { q:"Quel fichier contient le PSK et quelle est sa syntaxe ?", r:"/etc/ipsec.secrets. Syntaxe : 10.0.0.1 10.0.0.2 : PSK \"votre_cle_secrete\". Les deux IPs sont les adresses WAN des deux routeurs." },
        { q:"Pourquoi activer ip_forward sur les routeurs Ubuntu ?", r:"Par défaut, Linux ne forward pas les paquets entre interfaces. La commande sysctl -w net.ipv4.ip_forward=1 permet à Ubuntu d'agir comme routeur et de relayer les paquets entre eth0 (LAN) et eth1 (WAN)." },
        { q:"Comment vérifier que le tunnel est actif ?", r:"sudo ipsec status → affiche les connexions établies. Test pratique : ping 192.168.2.1 depuis Router1 → si réponse, le tunnel ESP est fonctionnel entre les deux LANs." },
        { q:"Quelle route statique faut-il ajouter sur Router1 ?", r:"sudo ip route add 192.168.2.0/24 via 10.0.0.2 dev eth1 → pour que les paquets destinés au LAN de Router2 soient envoyés via l'interface WAN (eth1) vers 10.0.0.2." },
      ]
    },
    {
      id: "routage",
      titre: "Routage Statique et Dynamique (3 routeurs)",
      description: "Topologie 3 routeurs : R1 (LAN1 192.168.1.0/24) — R2 (transit) — R3 (LAN3 192.168.3.0/24). Liens WAN : 10.0.12.0/30 et 10.0.23.0/30.",
      questions: [
        { q:"Quelle route statique configurer sur R1 pour joindre LAN3 ?", r:"ip route 192.168.3.0 255.255.255.0 10.0.12.2 → envoie les paquets vers 192.168.3.0/24 via le next-hop 10.0.12.2 (interface WAN de R2 côté R1)." },
        { q:"Quelle est la différence entre /30 et /24 dans ce schéma ?", r:"/30 = 4 adresses (2 utilisables) pour les liens point-à-point entre routeurs. /24 = 254 adresses pour les LANs des PCs. On économise les adresses sur les liens inter-routeurs." },
        { q:"Comment configurer OSPF sur R1 dans ce schéma ?", r:"router ospf 1 → network 192.168.1.0 0.0.0.255 area 0 → network 10.0.12.0 0.0.0.3 area 0. Le masque inversé 0.0.0.3 correspond au /30." },
        { q:"Pourquoi RIP est-il limité à 15 sauts ?", r:"RIP utilise le nombre de sauts comme métrique. À 16 sauts, la destination est considérée inaccessible. Avec 3 routeurs = 2 sauts ici, RIP fonctionne. Mais dans un grand réseau, RIP échoue là où OSPF réussit." },
        { q:"Que faire si le lien R1-R2 tombe avec OSPF actif ?", r:"OSPF reconverge automatiquement : il détecte la panne, échange des LSA (Link State Advertisement), recalcule l'arbre SPF et trouve une route alternative si elle existe. Avec routage statique, le trafic serait interrompu sans intervention manuelle." },
        { q:"Quelle commande vérifie la table de routage sur un routeur Cisco ?", r:"show ip route → affiche toutes les routes : C (Connected), S (Static), R (RIP), O (OSPF). Pour tester : ping 192.168.3.10 depuis R1." },
      ]
    },
    {
      id: "openvpn",
      titre: "Architecture OpenVPN (Client ↔ Serveur)",
      description: "Client VPN distant (IP publique dynamique) se connecte au Serveur OpenVPN (IP publique fixe). Réseau VPN interne : 10.8.0.0/24. LAN interne entreprise : 192.168.10.0/24.",
      questions: [
        { q:"Quel port et protocole utilise OpenVPN par défaut ?", r:"UDP port 1194. UDP est préféré pour les performances (moins de surcoût que TCP). TCP peut être utilisé pour traverser les firewalls restrictifs." },
        { q:"Quel est le rôle de easy-rsa dans le TP OpenVPN ?", r:"easy-rsa est l'outil de gestion PKI. Il permet de créer la CA (Certificate Authority), générer les certificats serveur et clients, et les signer. Sans PKI, pas d'authentification par certificat." },
        { q:"Que fait la commande ./easyrsa build-ca ?", r:"Crée l'autorité de certification racine : génère la clé privée de la CA et son certificat auto-signé. Tous les certificats serveur et clients seront signés par cette CA → base de la confiance dans le tunnel." },
        { q:"Pourquoi l'adresse IP 10.8.0.0/24 est-elle attribuée ?", r:"C'est le réseau VPN virtuel. Chaque client connecté reçoit une IP dans ce range (ex: 10.8.0.6). Le serveur a 10.8.0.1. Ce réseau est distinct du LAN interne (192.168.10.0/24) et sert à router le trafic VPN." },
        { q:"Comment vérifier que le tunnel est opérationnel côté client ?", r:"1) ip addr → voir l'interface tun0 avec une IP en 10.8.0.x. 2) ping 10.8.0.1 → joindre le serveur VPN. 3) ping 192.168.10.1 → joindre le réseau interne (si route configurée)." },
      ]
    }
  ],
  astuces: [
    { cat:"🎯 Identifier le bon VPN", tips:["2 sites/agences/réseaux → Site-to-Site (routeur-routeur)","Télétravailleur/employé distant → Remote Access (client-serveur)","IP changeante/mobilité → VPN Mobile (WireGuard/MOBIKE IKEv2)"] },
    { cat:"🔑 Choisir le bon protocole", tips:["Haute sécurité + entreprise → IPsec ESP + IKEv2","Simple + compatible partout → OpenVPN (TLS)","Moderne + performances → WireGuard","JAMAIS : PPTP (obsolète), L2TP seul (pas de chiffrement)"] },
    { cat:"⚙️ Cisco IPsec : ordre de config", tips:["1. ACL trafic intéressant (access-list 110 permit ip ...)","2. ISAKMP phase 1 (crypto isakmp policy 10)","3. PSK du peer (crypto isakmp key cisco address X.X.X.X)","4. Transform-set phase 2 (crypto ipsec transform-set)","5. Crypto map (crypto map VPN-MAP 10 ipsec-isakmp)","6. Appliquer sur interface (interface S0/0/0 → crypto map VPN-MAP)"] },
    { cat:"🔍 Diagnostiquer un tunnel en panne", tips:["Tunnel UP mais pas de trafic → ROUTAGE (route retour manquante = cause #1)","Connexion refusée → certificat expiré/révoqué ou port bloqué","show crypto ipsec sa → pkts encaps = 0 ? Pas de trafic intéressant","Lenteur → MTU mal configurée ou surcharge CPU (overhead chiffrement)"] },
    { cat:"🏗️ Architecture : mémoriser les compromis", tips:["Centralisée = simple à gérer BUT point unique de défaillance (SPOF)","Maillée = haute dispo + perf BUT complexe (N*(N-1)/2 tunnels)","Full Tunnel = sécurité max BUT lent. Split Tunnel = rapide BUT fuite possible"] },
    { cat:"⚡ Répondre à un incident", tips:["Toujours : Identifier → Isoler → Analyser logs → Révoquer → Corriger","Brute force → lockout automatique + MFA + fail2ban","Certificat compromis → CRL immédiatement","Connexion pays inconnu → isoler AVANT d'analyser (containment first)"] },
    { cat:"📋 Mots-clés qui trahissent la réponse", tips:["'Réseau public / Wi-Fi' → chiffrement fort + MFA","'Sessions passées / enregistrement' → PFS obligatoire","'NAT entre les sites' → NAT-T (ESP sur UDP/4500), AH incompatible NAT","'Certificat expiré' → vérifier CRL, renouveler PKI"] },
    { cat:"🔢 Numéros à retenir", tips:["OpenVPN → UDP/TCP port 1194","IPsec IKE → UDP port 500","IPsec NAT-T → UDP port 4500","HTTPS/TLS → TCP port 443","Cisco : DH group 2 minimum → group 14+ recommandé"] },
  ]
};

// =====================
// SVG TOPOLOGIES
// =====================

function TopoDevice({ x, y, type, label, sublabel, color="#3b82f6", theme }) {
  const icons = {
    router: <g>
      <circle cx={x} cy={y} r={18} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.5}/>
      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="central" fontSize={16}>🔀</text>
    </g>,
    pc: <g>
      <rect x={x-14} y={y-11} width={28} height={22} rx={3} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.2}/>
      <rect x={x-6} y={y+11} width={12} height={4} rx={1} fill={color} fillOpacity={0.3}/>
      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="central" fontSize={12}>💻</text>
    </g>,
    switch: <g>
      <rect x={x-16} y={y-8} width={32} height={16} rx={4} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.2}/>
      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="central" fontSize={11}>🔌</text>
    </g>,
    server: <g>
      <rect x={x-12} y={y-16} width={24} height={32} rx={3} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.2}/>
      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="central" fontSize={13}>🖥️</text>
    </g>,
    cloud: <g>
      <ellipse cx={x} cy={y} rx={26} ry={16} fill="#64748b" fillOpacity={0.1} stroke="#64748b" strokeWidth={1} strokeDasharray="4 2"/>
      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="central" fontSize={14}>☁️</text>
    </g>
  };
  return <g>
    {icons[type]}
    <text x={x} y={y+28} textAnchor="middle" fontSize={11} fontWeight={600} fill={theme?.svgText || "#e2e8f0"}>{label}</text>
    {sublabel && <text x={x} y={y+40} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#94a3b8"}>{sublabel}</text>}
  </g>;
}

function TopoLine({ x1,y1,x2,y2, color="#334155", dashed=false, label="", tunnel=false, theme }) {
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  const tunnelColor = theme?.topoTunnel || "#ec4899";
  const tunnelText = theme?.topoTunnelText || "#be185d";
  return <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={tunnel ? tunnelColor : color}
      strokeWidth={tunnel?2.5:1.5}
      strokeDasharray={dashed?"6 3":"none"}
      opacity={tunnel?0.7:0.5}/>
    {label && <text x={mx} y={my-6} textAnchor="middle" fontSize={9} fill={tunnel ? tunnelText : (theme?.svgMuted || "#64748b")} fontWeight={tunnel?700:400}>{label}</text>}
    {tunnel && <text x={mx} y={my+6} textAnchor="middle" fontSize={8} fill={tunnelColor} fontWeight={700}>ESP🔒</text>}
  </g>;
}

function TopoCiscoIPsec({ theme }) {
  return <svg width="100%" viewBox="0 0 560 210" style={{display:"block"}}>
    {/* Internet cloud */}
    <TopoDevice x={280} y={105} type="cloud" label="Internet" sublabel="R2 : 10.1.1.x / 10.2.2.x" color="#64748b" theme={theme}/>
    {/* R1 side */}
    <TopoDevice x={80} y={105} type="router" label="R1" sublabel="S0/0/0: 10.1.1.2" color="#0ea5e9" theme={theme}/>
    <TopoDevice x={80} y={190} type="pc" label="PC-A" sublabel="192.168.1.3" color="#06b6d4" theme={theme}/>
    <TopoLine x1={80} y1={123} x2={80} y2={175} theme={theme}/>
    <text x={80} y={175} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>G0/0: 192.168.1.1</text>
    {/* R3 side */}
    <TopoDevice x={480} y={105} type="router" label="R3" sublabel="S0/0/1: 10.2.2.2" color="#0ea5e9" theme={theme}/>
    <TopoDevice x={480} y={190} type="pc" label="PC-C" sublabel="192.168.3.3" color="#06b6d4" theme={theme}/>
    <TopoLine x1={480} y1={123} x2={480} y2={175} theme={theme}/>
    <text x={480} y={175} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>G0/0: 192.168.3.1</text>
    {/* R2 (transit) */}
    <TopoDevice x={280} y={40} type="router" label="R2 (transit)" sublabel="10.1.1.1 | 10.2.2.1" color="#f472b6" theme={theme}/>
    <TopoDevice x={200} y={190} type="pc" label="PC-B" sublabel="192.168.2.3" color="#94a3b8" theme={theme}/>
    <TopoLine x1={215} y1={190} x2={215} y2={130} color="#94a3b8" theme={theme}/>
    <text x={210} y={125} textAnchor="middle" fontSize={8} fill={theme?.svgMuted || "#64748b"}>192.168.2.1</text>
    {/* WAN links */}
    <TopoLine x1={98} y1={105} x2={254} y2={58} color={theme?.svgMuted || "#64748b"} label="10.1.1.0/30" theme={theme}/>
    <TopoLine x1={306} y1={58} x2={462} y2={105} color={theme?.svgMuted || "#64748b"} label="10.2.2.0/30" theme={theme}/>
    {/* IPsec tunnel */}
    <TopoLine x1={98} y1={112} x2={462} y2={112} tunnel={true} label="Tunnel IPsec" theme={theme}/>
    {/* Labels */}
    <rect x={10} y={8} width={130} height={24} rx={4} fill={theme?.cardBg2 || "#1e1b4b"} stroke={theme?.accent || "#ec4899"} strokeWidth={0.5}/>
    <text x={75} y={22} textAnchor="middle" fontSize={10} fill={theme?.accentLight || "#f472b6"} fontWeight={700}>ACL 110 : LAN1 ↔ LAN3</text>
  </svg>;
}

function TopoStrongSwan({ theme }) {
  return <svg width="100%" viewBox="0 0 560 220" style={{display:"block"}}>
    {/* Router1 */}
    <TopoDevice x={100} y={110} type="router" label="Router1 (Ubuntu)" sublabel="WAN:10.0.0.1" color="#0ea5e9" theme={theme}/>
    <TopoDevice x={100} y={195} type="pc" label="LAN PC" sublabel="192.168.1.0/24" color="#06b6d4" theme={theme}/>
    <TopoLine x1={100} y1={128} x2={100} y2={178} theme={theme}/>
    <text x={100} y={178} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>eth0:192.168.1.1</text>
    {/* Router2 */}
    <TopoDevice x={460} y={110} type="router" label="Router2 (Ubuntu)" sublabel="WAN:10.0.0.2" color="#0ea5e9" theme={theme}/>
    <TopoDevice x={460} y={195} type="pc" label="LAN PC" sublabel="192.168.2.0/24" color="#06b6d4" theme={theme}/>
    <TopoLine x1={460} y1={128} x2={460} y2={178} theme={theme}/>
    <text x={460} y={178} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>eth0:192.168.2.1</text>
    {/* WAN */}
    <TopoLine x1={118} y1={105} x2={442} y2={105} color={theme?.svgMuted || "#64748b"} label="WAN : 10.0.0.0/24 (eth1)" theme={theme}/>
    {/* IPsec */}
    <TopoLine x1={118} y1={116} x2={442} y2={116} tunnel={true} label="IKEv2 + ESP (PSK)" theme={theme}/>
    {/* Config notes */}
    <rect x={170} y={30} width={220} height={50} rx={6} fill={theme?.cardBg2 || "#0f172a"} stroke={theme?.cardBorder || "#334155"} strokeWidth={0.5}/>
    <text x={280} y={48} textAnchor="middle" fontSize={10} fill={theme?.textMuted || "#94a3b8"} fontWeight={600}>ipsec.conf — Router1</text>
    <text x={280} y={62} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>left=10.0.0.1 / leftsubnet=192.168.1.0/24</text>
    <text x={280} y={73} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>right=10.0.0.2 / rightsubnet=192.168.2.0/24</text>
  </svg>;
}

function TopoRoutage({ theme }) {
  return <svg width="100%" viewBox="0 0 560 230" style={{display:"block"}}>
    {/* Routers */}
    <TopoDevice x={80} y={100} type="router" label="R1" sublabel="G0/0: 192.168.1.1" color="#0ea5e9" theme={theme}/>
    <TopoDevice x={280} y={100} type="router" label="R2" sublabel="G0/0: 10.0.12.2 | G0/1: 10.0.23.1" color="#f472b6" theme={theme}/>
    <TopoDevice x={480} y={100} type="router" label="R3" sublabel="G0/1: 192.168.3.1" color="#0ea5e9" theme={theme}/>
    {/* WAN links */}
    <TopoLine x1={98} y1={100} x2={262} y2={100} label="10.0.12.0/30" theme={theme}/>
    <TopoLine x1={298} y1={100} x2={462} y2={100} label="10.0.23.0/30" theme={theme}/>
    {/* Switches + PCs */}
    <TopoDevice x={80} y={165} type="switch" label="SW1" color="#06b6d4" theme={theme}/>
    <TopoDevice x={80} y={210} type="pc" label="PC1" sublabel="192.168.1.10" color="#06b6d4" theme={theme}/>
    <TopoLine x1={80} y1={118} x2={80} y2={157} theme={theme}/>
    <TopoLine x1={80} y1={173} x2={80} y2={200} theme={theme}/>
    <TopoDevice x={480} y={165} type="switch" label="SW3" color="#06b6d4" theme={theme}/>
    <TopoDevice x={480} y={210} type="pc" label="PC3" sublabel="192.168.3.10" color="#06b6d4" theme={theme}/>
    <TopoLine x1={480} y1={118} x2={480} y2={157} theme={theme}/>
    <TopoLine x1={480} y1={173} x2={480} y2={200} theme={theme}/>
    <TopoDevice x={280} y={165} type="switch" label="SW2" color="#94a3b8" theme={theme}/>
    <TopoDevice x={280} y={210} type="pc" label="PC2" sublabel="192.168.2.x" color="#94a3b8" theme={theme}/>
    <TopoLine x1={280} y1={118} x2={280} y2={157} theme={theme}/>
    <TopoLine x1={280} y1={173} x2={280} y2={200} theme={theme}/>
    {/* R1 interface label */}
    <text x={80} y={83} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>G0/1: 10.0.12.1</text>
    <text x={480} y={83} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>G0/0: 10.0.23.2</text>
    {/* Route note */}
    <rect x={155} y={20} width={250} height={32} rx={5} fill={theme?.cardBg2 || "#0f172a"} stroke={theme?.cardBorder || "#334155"} strokeWidth={0.5}/>
    <text x={280} y={34} textAnchor="middle" fontSize={10} fill={theme?.accentLight || "#f472b6"} fontWeight={700}>Route statique R1 → LAN3</text>
    <text x={280} y={46} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>ip route 192.168.3.0 255.255.255.0 10.0.12.2</text>
  </svg>;
}

function TopoOpenVPN({ theme }) {
  return <svg width="100%" viewBox="0 0 560 220" style={{display:"block"}}>
    {/* Client */}
    <TopoDevice x={80} y={110} type="pc" label="Client VPN" sublabel="IP publique dyn." color="#06b6d4" theme={theme}/>
    {/* Cloud */}
    <TopoDevice x={280} y={110} type="cloud" label="Internet" sublabel="réseau non fiable" color="#64748b" theme={theme}/>
    {/* Serveur OpenVPN */}
    <TopoDevice x={460} y={110} type="server" label="Serveur OpenVPN" sublabel="IP publique fixe :1194" color="#ec4899" theme={theme}/>
    {/* LAN interne */}
    <TopoDevice x={460} y={185} type="switch" label="LAN Interne" sublabel="192.168.10.0/24" color="#0ea5e9" theme={theme}/>
    <TopoLine x1={460} y1={128} x2={460} y2={170} theme={theme}/>
    {/* Tunnel */}
    <TopoLine x1={96} y1={110} x2={254} y2={110} color={theme?.svgMuted || "#64748b"} label="Trafic chiffré" theme={theme}/>
    <TopoLine x1={306} y1={110} x2={443} y2={110} color={theme?.svgMuted || "#64748b"} theme={theme}/>
    <TopoLine x1={96} y1={120} x2={443} y2={120} tunnel={true} label="Tunnel TLS (UDP 1194)" theme={theme}/>
    {/* VPN pool */}
    <rect x={155} y={30} width={250} height={42} rx={5} fill={theme?.cardBg2 || "#0f172a"} stroke={theme?.accent || "#ec4899"} strokeWidth={0.5}/>
    <text x={280} y={46} textAnchor="middle" fontSize={10} fill={theme?.accentLight || "#f472b6"} fontWeight={700}>Réseau VPN virtuel</text>
    <text x={280} y={58} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>10.8.0.0/24 (tun0)</text>
    <text x={280} y={68} textAnchor="middle" fontSize={9} fill={theme?.svgMuted || "#64748b"}>Client → 10.8.0.6 | Serveur → 10.8.0.1</text>
    {/* PKI note */}
    <rect x={10} y={155} width={110} height={42} rx={5} fill={theme?.cardBg2 || "#0f172a"} stroke={theme?.primary || "#0ea5e9"} strokeWidth={0.5}/>
    <text x={65} y={170} textAnchor="middle" fontSize={9} fill={theme?.success || "#34d399"} fontWeight={700}>PKI (easy-rsa)</text>
    <text x={65} y={182} textAnchor="middle" fontSize={8} fill={theme?.svgMuted || "#64748b"}>CA → Serveur cert</text>
    <text x={65} y={192} textAnchor="middle" fontSize={8} fill={theme?.svgMuted || "#64748b"}>CA → Client cert</text>
  </svg>;
}

const TOPO_SVGS = { "cisco-ipsec": TopoCiscoIPsec, "strongswan": TopoStrongSwan, "routage": TopoRoutage, "openvpn": TopoOpenVPN };

// =====================
// MAIN APP
// =====================

const tags = ["Tous","Fondamental","Protocole","Sécurité","Architecture","Performance","Outil"];

const TAB_LABELS = {
  definitions: "Définitions",
  scenarios: "Scénarios",
  topologies: "Topologies",
  astuces: "Astuces",
};

export default function App() {
  const [tab, setTab] = useState("definitions");
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("Tous");
  const [flipped, setFlipped] = useState({});
  const [openScenario, setOpenScenario] = useState(null);
  const [showAnswer, setShowAnswer] = useState({});
  const [openTopo, setOpenTopo] = useState("cisco-ipsec");
  const [openQ, setOpenQ] = useState({});
  const [isDark, setIsDark] = useState(() => localStorage.getItem("vpn-theme") === "dark");
  const [pdfMenuOpen, setPdfMenuOpen] = useState(false);

  const t = themes[isDark ? "dark" : "light"];

  useEffect(() => {
    localStorage.setItem("vpn-theme", isDark ? "dark" : "light");
    document.body.style.background = t.pageBg;
  }, [isDark, t.pageBg]);

  useEffect(() => {
    if (!pdfMenuOpen) return;
    const close = () => setPdfMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [pdfMenuOpen]);

  const filteredDefs = data.definitions.filter(d => {
    const matchTag = filterTag === "Tous" || d.tag === filterTag;
    const matchSearch = d.term.toLowerCase().includes(search.toLowerCase()) || d.def.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const selectedTopo = data.topologies.find(topo => topo.id === openTopo);
  const TopoSVG = TOPO_SVGS[openTopo];

  const handlePdfDownload = (scope) => {
    downloadPdf(data, scope, tab);
    setPdfMenuOpen(false);
  };

  const actionBtnStyle = {
    padding: "6px 12px",
    borderRadius: 9,
    border: `1px solid ${t.actionBtnBorder}`,
    background: t.actionBtnBg,
    color: t.actionBtnText,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s",
  };

  return (
    <div style={{ minHeight:"100vh", background:t.pageBg, color:t.pageColor, fontFamily:"'Segoe UI', system-ui, sans-serif", paddingBottom:40, transition:"background 0.3s, color 0.3s" }}>
      {/* Header */}
      <div style={{ background:t.headerBg, borderBottom:`1px solid ${t.headerBorder}`, padding:"22px 24px 16px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:24 }}>🔐</span>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:t.textTitle }}>VPN & Réseaux Cisco — Révision Exam</h1>
            <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ background:t.badge, color:"white", fontSize:11, padding:"2px 10px", borderRadius:20, fontWeight:700 }}>EXAM PREP</span>
              <button onClick={() => setIsDark(d => !d)} style={actionBtnStyle} title={isDark ? "Passer au thème clair" : "Passer au thème sombre"}>
                {isDark ? "☀️ Clair" : "🌙 Sombre"}
              </button>
              <div style={{ position:"relative" }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setPdfMenuOpen(o => !o)} style={{ ...actionBtnStyle, background: t.buttonGradient, color: "white", border: "none" }}>
                  📥 PDF ▾
                </button>
                {pdfMenuOpen && (
                  <div style={{ position:"absolute", right:0, top:"calc(100% + 6px)", background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:10, boxShadow:`0 8px 24px ${t.shadow}`, minWidth:220, zIndex:200, overflow:"hidden" }}>
                    <button onClick={() => handlePdfDownload("current")} style={{ display:"block", width:"100%", padding:"10px 14px", border:"none", background:"transparent", color:t.text, textAlign:"left", cursor:"pointer", fontSize:12, fontWeight:600 }}
                      onMouseEnter={e => e.currentTarget.style.background = t.cardBg2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      📄 Onglet actuel ({TAB_LABELS[tab]})
                    </button>
                    <button onClick={() => handlePdfDownload("all")} style={{ display:"block", width:"100%", padding:"10px 14px", border:"none", borderTop:`1px solid ${t.cardBorder}`, background:"transparent", color:t.text, textAlign:"left", cursor:"pointer", fontSize:12, fontWeight:600 }}
                      onMouseEnter={e => e.currentTarget.style.background = t.cardBg2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      📚 Contenu complet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p style={{ margin:"0 0 14px 34px", color:t.textMuted, fontSize:12 }}>
            {data.definitions.length} définitions · {data.scenarios.length} scénarios · {data.topologies.length} topologies réseau · astuces exam
          </p>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {[
              { id:"definitions", label:"📚 Définitions", count:data.definitions.length },
              { id:"scenarios", label:"🎭 Scénarios", count:data.scenarios.length },
              { id:"topologies", label:"🖧 Topologies Cisco", count:data.topologies.length },
              { id:"astuces", label:"💡 Astuces", count:data.astuces.length }
            ].map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer",
                fontWeight:600, fontSize:12, transition:"all 0.2s",
                background: tab===item.id ? t.tabActive : "transparent",
                color: tab===item.id ? "white" : t.tabInactive,
                borderBottom: tab===item.id ? `2px solid ${t.tabActiveBorder}` : "2px solid transparent"
              }}>
                {item.label}
                <span style={{ marginLeft:5, background:tab===item.id ? t.tabCountActiveBg : t.tabCountBg, borderRadius:10, padding:"1px 7px", fontSize:10 }}>{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"20px 14px" }}>

        {/* ── DEFINITIONS ── */}
        {tab === "definitions" && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <input placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ flex:1, minWidth:180, padding:"8px 12px", borderRadius:8, background:t.inputBg, border:`1px solid ${t.inputBorder}`, color:t.text, fontSize:13, outline:"none" }}/>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
              {tags.map(tag => (
                <button key={tag} onClick={()=>setFilterTag(tag)} style={{
                  padding:"4px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:600,
                  background: filterTag===tag ? (tagColors[tag]||t.accent) : t.cardBg, color: filterTag===tag ? "white" : t.textMuted
                }}>{tag}</button>
              ))}
            </div>
            <p style={{ color:t.textSubtle, fontSize:11, marginBottom:14 }}>{filteredDefs.length} définition(s) · Cliquez pour voir la définition</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {filteredDefs.map((d,i) => (
                <div key={i} onClick={()=>setFlipped(f=>({...f,[i]:!f[i]}))}
                  style={{ background:flipped[i] ? t.cardBgAlt : t.cardBg,
                    border:`1px solid ${flipped[i]?(tagColors[d.tag]||t.accent):t.cardBorder}`, borderRadius:12, padding:16, cursor:"pointer",
                    transition:"all 0.2s", minHeight:100, position:"relative",
                    boxShadow:flipped[i]?`0 4px 18px ${tagColors[d.tag]||t.accent}35`:"none" }}>
                  <div style={{ position:"absolute", top:10, right:10 }}>
                    <span style={{ background:tagColors[d.tag]||t.accent, color:"white", fontSize:9, padding:"2px 7px", borderRadius:10, fontWeight:700 }}>{d.tag}</span>
                  </div>
                  <div style={{ fontSize:20, marginBottom:6 }}>{d.emoji}</div>
                  {!flipped[i] ? <>
                    <div style={{ fontWeight:700, fontSize:14, color:t.textTitle, paddingRight:56 }}>{d.term}</div>
                    <div style={{ color:t.textSubtle, fontSize:11, marginTop:6 }}>👆 Cliquez pour la définition</div>
                  </> : <>
                    <div style={{ fontWeight:700, fontSize:12, color:t.flippedTerm, marginBottom:6, paddingRight:56 }}>{d.term}</div>
                    <div style={{ color:t.bodyText, fontSize:12, lineHeight:1.6 }}>{d.def}</div>
                  </>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCENARIOS ── */}
        {tab === "scenarios" && (
          <div>
            <p style={{ color:t.textMuted, fontSize:13, marginBottom:18 }}>Réfléchissez avant de voir le corrigé !</p>
            {data.scenarios.map(s => (
              <div key={s.id} style={{ background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:14, marginBottom:14, overflow:"hidden",
                boxShadow:openScenario===s.id ? `0 4px 24px ${t.shadow}` : "none", transition:"box-shadow 0.3s" }}>
                <div onClick={()=>setOpenScenario(openScenario===s.id?null:s.id)}
                  style={{ padding:"16px 18px", cursor:"pointer", display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ background:t.accent, color:"white", width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, flexShrink:0 }}>S{s.id}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:t.textTitle, marginBottom:3 }}>{s.titre}</div>
                    <div style={{ color:t.textMuted, fontSize:12 }}>{s.contexte}</div>
                  </div>
                  <span style={{ color:t.textSubtle, fontSize:18 }}>{openScenario===s.id?"▲":"▼"}</span>
                </div>
                {openScenario===s.id && (
                  <div style={{ padding:"0 18px 18px" }}>
                    <div style={{ background:t.questionBg, borderRadius:10, padding:14, marginBottom:14, borderLeft:`3px solid ${t.questionBorder}` }}>
                      <div style={{ color:t.primary, fontWeight:700, fontSize:11, marginBottom:6 }}>❓ QUESTION</div>
                      <div style={{ color:t.text, fontSize:13, lineHeight:1.6 }}>{s.question}</div>
                    </div>
                    {!showAnswer[s.id] ? (
                      <button onClick={()=>setShowAnswer(a=>({...a,[s.id]:true}))}
                        style={{ background:t.buttonGradient, color:"white", border:"none", padding:"9px 20px", borderRadius:9, cursor:"pointer", fontWeight:700, fontSize:13, width:"100%" }}>
                        🔓 Voir le corrigé
                      </button>
                    ) : (
                      <div>
                        <div style={{ background:t.answerBg, border:`1px solid ${t.answerBorder}`, borderRadius:10, padding:14, marginBottom:10 }}>
                          <div style={{ color:t.successText, fontWeight:700, fontSize:11, marginBottom:10 }}>✅ CORRIGÉ</div>
                          {s.corrige.points.map((p,i) => (
                            <div key={i} style={{ display:"flex", gap:8, marginBottom:8, paddingBottom:8, borderBottom:i<s.corrige.points.length-1?`1px solid ${t.cardBorder}`:"none" }}>
                              <span style={{ background:t.successBg, color:t.successText, width:20, height:20, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10, flexShrink:0 }}>{i+1}</span>
                              <span style={{ color:t.bodyText, fontSize:12, lineHeight:1.6 }}>{p}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ background:t.dangerBg, border:`1px solid ${t.dangerBorder}`, borderRadius:10, padding:12, marginBottom:8 }}>
                          <div style={{ color:t.danger, fontWeight:700, fontSize:11, marginBottom:4 }}>⚠️ PIÈGE CLASSIQUE</div>
                          <div style={{ color:t.dangerText, fontSize:12, lineHeight:1.6 }}>{s.corrige.piege}</div>
                        </div>
                        <button onClick={()=>setShowAnswer(a=>({...a,[s.id]:false}))}
                          style={{ background:"transparent", color:t.textSubtle, border:`1px solid ${t.cardBorder}`, padding:"5px 14px", borderRadius:7, cursor:"pointer", fontSize:11, width:"100%" }}>
                          Masquer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TOPOLOGIES ── */}
        {tab === "topologies" && (
          <div>
            <p style={{ color:t.textMuted, fontSize:13, marginBottom:16 }}>
              Topologies exactes tirées des TPs. Étudie chaque schéma puis réponds aux questions type exam.
            </p>
            {/* Tabs topologies */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
              {data.topologies.map(topo => (
                <button key={topo.id} onClick={()=>{ setOpenTopo(topo.id); setOpenQ({}); }} style={{
                  padding:"7px 13px", borderRadius:9, border:`1px solid ${openTopo===topo.id ? t.topoActiveBorder : t.cardBorder}`,
                  cursor:"pointer", fontSize:11, fontWeight:600, transition:"all 0.2s",
                  background:openTopo===topo.id ? t.topoActiveBg : t.cardBg, color:openTopo===topo.id ? t.topoActiveText : t.textMuted
                }}>{topo.titre.split(" (")[0].split(" :")[0].substring(0,30)}</button>
              ))}
            </div>

            {selectedTopo && TopoSVG && (
              <div>
                {/* Topology card */}
                <div style={{ background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:14, marginBottom:16, overflow:"hidden" }}>
                  {/* Header */}
                  <div style={{ padding:"14px 18px 10px", borderBottom:`1px solid ${t.cardBorder}` }}>
                    <div style={{ fontWeight:700, fontSize:15, color:t.textTitle, marginBottom:4 }}>🖧 {selectedTopo.titre}</div>
                    <div style={{ color:t.textMuted, fontSize:12 }}>{selectedTopo.description}</div>
                  </div>
                  {/* SVG diagram */}
                  <div style={{ background:t.svgBg, padding:"16px 10px 10px" }}>
                    <TopoSVG theme={t}/>
                    {/* Legend */}
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:10, paddingLeft:8 }}>
                      {[[t.topoTunnel,"Tunnel IPsec/VPN chiffré"],[t.svgMuted,"Lien réseau standard"],[t.primary,"Routeur"],["#06b6d4","PC / LAN"],[t.accentLight,"Routeur transit"]].map(([c,l]) => (
                        <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:t.textSubtle }}>
                          <div style={{ width:16, height:3, background:c, borderRadius:2 }}/>
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:t.textTitle, marginBottom:12 }}>
                    ❓ Questions type exam sur cette topologie
                  </div>
                  {selectedTopo.questions.map((qq, i) => (
                    <div key={i} style={{ background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:10, marginBottom:8, overflow:"hidden" }}>
                      <div onClick={()=>setOpenQ(q=>({...q,[i]:!q[i]}))}
                        style={{ padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"flex-start", gap:10 }}>
                        <span style={{ background:t.questionBg, color:t.primary, width:24, height:24, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0, border:`1px solid ${t.questionBorder}` }}>Q{i+1}</span>
                        <span style={{ color:t.text, fontSize:13, flex:1, lineHeight:1.5 }}>{qq.q}</span>
                        <span style={{ color:t.textSubtle, fontSize:16, flexShrink:0 }}>{openQ[i]?"▲":"▼"}</span>
                      </div>
                      {openQ[i] && (
                        <div style={{ padding:"0 16px 14px 50px" }}>
                          <div style={{ background:t.answerBg, border:`1px solid ${t.answerBorder}`, borderRadius:8, padding:"10px 14px" }}>
                            <div style={{ color:t.successText, fontWeight:700, fontSize:10, marginBottom:5 }}>✅ RÉPONSE</div>
                            <div style={{ color:t.bodyText, fontSize:12, lineHeight:1.7 }}>{qq.r}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Config block for Cisco */}
                {openTopo === "cisco-ipsec" && (
                  <div style={{ background:t.codeBg, border:`1px solid ${t.codeBorder}`, borderRadius:12, padding:16, marginTop:6 }}>
                    <div style={{ color:t.accentLight, fontWeight:700, fontSize:12, marginBottom:10 }}>⚙️ Commandes Cisco à mémoriser (R1)</div>
                    <pre style={{ margin:0, fontSize:11, color:t.codeText, lineHeight:1.8, overflowX:"auto", whiteSpace:"pre-wrap" }}>
{`! 1. Trafic intéressant (LAN1 ↔ LAN3)
access-list 110 permit ip 192.168.1.0 0.0.0.255 192.168.3.0 0.0.0.255

! 2. Phase 1 ISAKMP
crypto isakmp policy 10
 encryption aes
 authentication pre-share
 group 2
crypto isakmp key cisco address 10.2.2.2

! 3. Phase 2 IPsec (transform-set + crypto map)
crypto ipsec transform-set VPN-SET esp-3des esp-sha-hmac
crypto map VPN-MAP 10 ipsec-isakmp
 set peer 10.2.2.2
 set transform-set VPN-SET
 match address 110

! 4. Appliquer sur interface WAN
interface S0/0/0
 crypto map VPN-MAP

! 5. Vérification
show crypto ipsec sa
show crypto isakmp sa`}
                    </pre>
                  </div>
                )}
                {openTopo === "routage" && (
                  <div style={{ background:t.codeBg, border:`1px solid ${t.codeBorder}`, borderRadius:12, padding:16, marginTop:6 }}>
                    <div style={{ color:t.accentLight, fontWeight:700, fontSize:12, marginBottom:10 }}>⚙️ Commandes routage Cisco à mémoriser</div>
                    <pre style={{ margin:0, fontSize:11, color:t.codeText, lineHeight:1.8, overflowX:"auto", whiteSpace:"pre-wrap" }}>
{`! === STATIQUE ===
ip route 192.168.3.0 255.255.255.0 10.0.12.2  ! Sur R1
ip route 0.0.0.0 0.0.0.0 10.0.12.2             ! Route par défaut

! === OSPF ===
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
 network 10.0.12.0 0.0.0.3 area 0

! === RIP ===
router rip
 version 2
 network 192.168.1.0
 network 10.0.12.0
 no auto-summary

! === VÉRIFICATION ===
show ip route
show ip ospf neighbor
ping 192.168.3.10`}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ASTUCES ── */}
        {tab === "astuces" && (
          <div>
            <div style={{ background:t.highlightBg, border:`1px solid ${t.highlightBorder}`, borderRadius:14, padding:"14px 18px", marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:15, color:t.highlightText, marginBottom:3 }}>💡 Fiches d'Astuces Universelles</div>
              <div style={{ color:t.textMuted, fontSize:12 }}>S'adapter à n'importe quel scénario d'examen, même inconnu.</div>
            </div>
            <div style={{ display:"grid", gap:12 }}>
              {data.astuces.map((a,i) => (
                <div key={i} style={{ background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:12, padding:16 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:t.textTitle, marginBottom:10 }}>{a.cat}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {a.tips.map((tip,j) => (
                      <div key={j} style={{ display:"flex", gap:8, padding:"7px 10px", background:t.tipBg, borderRadius:7, borderLeft:`3px solid ${t.tipBorder}` }}>
                        <span style={{ color:t.accentLight, fontWeight:700, flexShrink:0 }}>→</span>
                        <span style={{ color:t.bodyText, fontSize:12, lineHeight:1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Tableau protocoles */}
            <div style={{ marginTop:18, background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:12, padding:16 }}>
              <div style={{ fontWeight:800, fontSize:14, color:t.textTitle, marginBottom:14 }}>📊 Comparatif Protocoles</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                  <thead>
                    <tr style={{ background:t.tableHead }}>
                      {["Protocole","Sécurité","Complexité","Performance","Usage"].map(h => (
                        <th key={h} style={{ padding:"8px 10px", color:t.tableHeadText, fontWeight:700, textAlign:"left", borderBottom:`1px solid ${t.cardBorder}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["PPTP","❌ Faible","✅ Simple","⚡ Élevée","OBSOLÈTE — à bannir"],
                      ["L2TP/IPsec","✅ Bonne","⚠️ Moyenne","⚠️ Moyenne","Legacy, compatibilité"],
                      ["IPsec ESP+IKEv2","🔒 Très élevée","❌ Élevée","⚡ Élevée","Site-to-site entreprise"],
                      ["OpenVPN","🔒 Très élevée","⚠️ Moyenne","✅ Bonne","Télétravailleurs"],
                      ["WireGuard","🔒 Très élevée","✅ Simple","🚀 Max","Mobile, moderne"],
                    ].map((row,i) => (
                      <tr key={i} style={{ borderBottom:`1px solid ${t.cardBorder}` }}>
                        {row.map((cell,j) => (
                          <td key={j} style={{ padding:"8px 10px", color:j===0 ? t.textTitle : t.textMuted, fontWeight:j===0?700:400 }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Formule magique */}
            <div style={{ marginTop:14, background:t.formulaBg, border:`1px solid ${t.formulaBorder}`, borderRadius:12, padding:16 }}>
              <div style={{ fontWeight:800, fontSize:14, color:t.formulaText, marginBottom:10 }}>🏆 Formule magique exam</div>
              {["Lis le contexte → type VPN + menace + besoin perf","Réseau public → chiffrement fort + MFA + PFS","Tunnel UP mais pas de trafic → ROUTAGE en premier","Audit config → DES/MD5/PPTP/PSK court/sans PFS → tout changer","Cisco : ACL → ISAKMP → transform-set → crypto map → interface","IP changeante/mobilité → WireGuard ou IKEv2+MOBIKE"].map((tip,i) => (
                <div key={i} style={{ display:"flex", gap:8, padding:"5px 0", borderBottom:i<5?`1px solid ${t.formulaBorder}`:"none" }}>
                  <span style={{ color:t.formulaText, fontWeight:800, flexShrink:0 }}>{i+1}.</span>
                  <span style={{ color:t.bodyText, fontSize:12 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}