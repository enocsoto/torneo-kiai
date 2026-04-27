export const stringsOnline = {
  es: {
    "online.title": "Combate en línea (código IV)",
    "online.subtitle":
      "Un jugador crea la sala y el otro entra con el mismo código desde otro dispositivo. El progreso y el roster cuentan por invitado del navegador.",
    "online.hostTitle": "Crear sala (anfitrión)",
    "online.hostHint":
      "Elige tu guerrero. Se mostrará un código y un enlace para compartir.",
    "online.pickYourFighter": "Tu guerrero",
    "online.createRoom": "Generar código e invitación",
    "online.creating": "Creando…",
    "online.roomReady": "Sala lista — comparte",
    "online.shareLink": "Enlace para el rival",
    "online.waitJoin":
      "Esperando a que el rival se una y elija guerrero…",
    "online.refreshOnce": "Comprobar ahora",
    "online.joinTitle": "Unirse con código",
    "online.codeLabel": "Código",
    "online.pickRivalFighter": "Elige guerrero (jugador 2)",
    "online.joinBattle": "Entrar al combate",
    "online.joining": "Entrando…",
    "online.errorLoad": "No se pudo cargar el roster",
    "online.errorCreate": "No se pudo crear la sala",
    "online.errorJoin":
      "No se pudo unir. Revisa código y guerrero distinto al anfitrión.",
    "online.socketRealtimeError":
      "Sin conexión en tiempo real — usa el botón para actualizar.",
    "online.pasteCodeTitle": "Tengo un código de invitación",
    "online.pasteCodeHint":
      "Pega o escribe el código de 6 caracteres que te envió el anfitrión, o abre el enlace que compartió.",
    "online.pasteCodePlaceholder": "Ej. 2A7N9K",
    "online.continueWithCode": "Continuar con este código",
    "online.invalidCode":
      "El código debe tener 6 caracteres (mismo que muestra el anfitrión).",
    "online.copyCode": "Copiar código",
    "online.copyLink": "Copiar enlace",
    "online.copied": "Copiado al portapapeles",
    "online.copyFailed": "No se pudo copiar; copia a mano.",
    "online.useOtherCode": "Cambiar código / volver",
    "online.joinCodeUrlInvalid":
      "El código en el enlace no es válido (se necesitan 6 caracteres). Vuelve a pedirlo al anfitrión o pégalo a mano abajo en «Tengo un código».",
    "online.rosterNote":
      "Solo puedes elegir guerreros que ya tengas desbloqueados (4 al inicio; más con 3+ partidas con cada básico).",
    "torneo.title": "Torneo (ventana móvil)",
    "torneo.subtitle":
      "Top 4 por victorias en combates en línea (dos invitados) en los últimos días. Sirve para ver al campeón de periodo.",
    "torneo.window": "Ventana: {days} días (combates con código en línea).",
    "torneo.wins": "victorias",
    "torneo.errorLoad": "No se pudo cargar el torneo",
    "torneo.empty": "Aún no hay victorias en línea en este periodo.",
  },
  en: {
    "online.title": "Online battle (room code)",
    "online.subtitle":
      "One player creates a room; the other joins with the same code from another device. Progress and roster are tied to each device's guest id.",
    "online.hostTitle": "Create room (host)",
    "online.hostHint":
      "Pick your fighter. A code and link will appear to share.",
    "online.pickYourFighter": "Your fighter",
    "online.createRoom": "Generate code and invite",
    "online.creating": "Creating…",
    "online.roomReady": "Room ready — share",
    "online.shareLink": "Link for your opponent",
    "online.waitJoin":
      "Waiting for the opponent to join and pick a fighter…",
    "online.refreshOnce": "Check now",
    "online.joinTitle": "Join with code",
    "online.codeLabel": "Code",
    "online.pickRivalFighter": "Choose fighter (player 2)",
    "online.joinBattle": "Enter battle",
    "online.joining": "Joining…",
    "online.errorLoad": "Could not load roster",
    "online.errorCreate": "Could not create room",
    "online.errorJoin":
      "Could not join. Check code and a different fighter from the host.",
    "online.socketRealtimeError":
      "No real-time connection — use the refresh button to update.",
    "online.pasteCodeTitle": "I have an invite code",
    "online.pasteCodeHint":
      "Paste or type the 6-character code the host sent, or open the link they shared.",
    "online.pasteCodePlaceholder": "e.g. 2A7N9K",
    "online.continueWithCode": "Continue with this code",
    "online.invalidCode":
      "The code must be 6 characters (same as shown to the host).",
    "online.copyCode": "Copy code",
    "online.copyLink": "Copy link",
    "online.copied": "Copied to clipboard",
    "online.copyFailed": "Could not copy; copy manually.",
    "online.useOtherCode": "Change code / back",
    "online.joinCodeUrlInvalid":
      "The code in the link is not valid (6 characters required). Ask the host again or use \u201cI have a code\u201d below.",
    "online.rosterNote":
      "You can only pick fighters you have unlocked (4 at first; more after 3+ games with each starter).",
    "torneo.title": "Tournament (rolling window)",
    "torneo.subtitle":
      "Top 4 by wins in online (two-guest) battles in the last days. See the period champion.",
    "torneo.window": "Window: {days} days (online room battles).",
    "torneo.wins": "wins",
    "torneo.errorLoad": "Could not load tournament",
    "torneo.empty": "No online wins in this period yet.",
  },
} as const;
