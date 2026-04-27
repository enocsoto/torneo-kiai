export const stringsOop = {
  es: {
    "oop.modeLabel": "Guía de POO",
    "oop.modeHint":
      "Activa la guía y pulsa «Iniciar recorrido»: POO explicada en la pantalla, en pocos pasos.",
    "oop.startTour": "Iniciar recorrido",
    "oop.battleStartTour": "Guía del combate",
    "oop.tourBack": "Atrás",
    "oop.tourNext": "Siguiente",
    "oop.tourLast": "Listo",
    "oop.tourSkip": "Omitir",
    "oop.tourNextWithProgress": "Siguiente (paso {step} de {steps})",
    "oop.continueGuide": "Continuar guía",
    "oop.tourWaitingAction": "Esperando tu acción",
    "oop.stepIntroTitle": "¡Bienvenido a tu guía de POO!",
    "oop.stepSlotsTitle": "Clases e Instancias",
    "oop.stepRosterTitle": "Atributos, Constructor y Getter/Setter",
    "oop.stepPickTitle": "Escoge tus jugadores",
    "oop.stepReadyTitle": "¡Listo para crear el combate!",
    "oop.stepCreateTitle": "Constructor, Composición y Herencia",
    "oop.battleStepFightersTitle": "Encapsulamiento y Estado del Objeto",
    "oop.battleStepTurnTitle": "Objeto Activo y Polimorfismo",
    "oop.battleStepActionsTitle": "Métodos: el corazón de los objetos",
    "oop.battleStepAttackTitle": "¡Elige una técnica!",
    "oop.home.intro":
      "¡Hola! Este juego fue creado para enseñar Programación Orientada a Objetos (POO) en JavaScript de forma práctica. La idea es sencilla: mientras eliges guerreros y combates, vas a descubrir conceptos reales de POO como clases, instancias, atributos, métodos, constructores, herencia y polimorfismo. En JavaScript todo esto se escribe con la palabra clave class, y cada concepto que ves en pantalla tiene un equivalente directo en el código. ¡Empecemos paso a paso!",
    "oop.home.slots":
      "En JavaScript, una clase es como un molde o plantilla. Por ejemplo: class Guerrero { }. Ese molde define qué tiene y qué puede hacer todo guerrero. Cuando el juego crea a Goku o Vegeta, está haciendo new Guerrero('Goku', ...) — a eso se le llama instancia: un objeto concreto creado a partir del molde de la clase. Cada tarjeta que ves aquí es una instancia diferente, con sus propios valores. Al asignar un luchador a Jugador 1 o Jugador 2 estás eligiendo qué instancias van a participar en el combate.",
    "oop.home.roster":
      "Cada guerrero tiene atributos: vida, energía, defensa, lista de técnicas. En JavaScript, esos se declaran dentro de la clase — por ejemplo, this.vida = 2000 en el constructor. El constructor es el método especial que se ejecuta al hacer new Guerrero(...): es donde el objeto nace y sus valores iniciales quedan listos. Para proteger esos valores, el buen diseño usa getters (para leer) y setters (para modificar con reglas). Así el objeto controla su propio estado y nada externo lo rompe sin permiso.",
    "oop.home.create":
      "Al pulsar «Ir al combate», el sistema crea un objeto Combate. Ese objeto usa composición: no hereda de Guerrero, sino que lo contiene — guarda referencias a los dos luchadores dentro de sí mismo, junto con el turno actual, las barras de vida y el historial de acciones. La herencia aparece cuando un guerrero tiene una evolución (Super Saiyan): esa versión puede extender la clase base con extends, heredando todos sus atributos y sobreescribiendo (override) métodos para aumentar el daño. ¡La clase hija reutiliza el código de la padre y solo cambia lo que necesita!",
    "oop.home.pickPlayers":
      "Ahora elige dos guerreros cualquiera del roster: usa los botones Player 1 y Player 2 en las cartas. Cada elección conecta una instancia concreta con un rol del combate.",
    "oop.home.ready":
      "Ya elegiste dos instancias de Guerrero. Pulsa «Ir al combate» para construir el objeto Combate; al entrar, la guía seguirá con turnos, métodos y estado en tiempo real.",
    "oop.battle.fighters":
      "Lo que ves en estas dos tarjetas es el estado interno de cada instancia en tiempo real: vida restante, energía disponible, si tiene el esquive activo. En POO, el encapsulamiento protege ese estado — los atributos no se tocan directamente desde afuera; se leen a través de getters (como getSalud()) y se modifican solo con métodos que aplican las reglas del juego. Así el objeto siempre queda en un estado válido, sin importar quién lo use.",
    "oop.battle.turn":
      "El juego sabe a quién le toca por un atributo llamado turnoActivo en el objeto Combate. Fíjate cómo el mismo tipo de luchador — clase Guerrero — puede actuar como atacante o como defensor en rondas distintas. A eso se le llama polimorfismo: el mismo método atacar() produce efectos diferentes según quién lo invoca, con qué técnica y cuánta energía tiene en ese momento. El comportamiento cambia según el contexto, sin cambiar el nombre del método.",
    "oop.battle.actionsOop":
      "Cada botón que presionas está llamando a un método del objeto Combate: atacar(tecnica), recargarEnergia() o prepararEsquive(). En POO, un método es una función que vive dentro de la clase y puede leer y modificar los atributos del propio objeto usando this. Nunca modificas los atributos directamente desde afuera — le envías un mensaje al objeto y él decide qué hacer internamente. Eso es encapsulamiento en acción: el objeto es responsable de su propio comportamiento.",
    "oop.battle.attack":
      "Cada tarjeta de ataque es un elemento de la lista ataques[] del guerrero activo: un objeto con nombre, daño y costo de Ki. Cuando pulsas una, llamas a atacar(indice). El método recibe el índice, busca en this.ataques[indice], valida que haya Ki suficiente, aplica la fórmula de daño y actualiza la salud del rival con this.rival.salud -= daño. Nadie accede directamente a esas propiedades desde fuera — el objeto lo gestiona todo internamente.",
  },
  en: {
    "oop.modeLabel": "OOP guide",
    "oop.modeHint":
      "Enable the guide and tap «Start tour»—a short on-screen walkthrough of OOP.",
    "oop.startTour": "Start the tour",
    "oop.battleStartTour": "Battle guide",
    "oop.tourBack": "Back",
    "oop.tourNext": "Next",
    "oop.tourLast": "Done",
    "oop.tourSkip": "Skip",
    "oop.tourNextWithProgress": "Next (step {step} of {steps})",
    "oop.continueGuide": "Continue guide",
    "oop.tourWaitingAction": "Waiting for your action",
    "oop.stepIntroTitle": "Welcome to your OOP guide!",
    "oop.stepSlotsTitle": "Classes and Instances",
    "oop.stepRosterTitle": "Attributes, Constructor, and Getter/Setter",
    "oop.stepPickTitle": "Choose your players",
    "oop.stepReadyTitle": "Ready to create the battle!",
    "oop.stepCreateTitle": "Constructor, Composition, and Inheritance",
    "oop.battleStepFightersTitle": "Encapsulation and Object State",
    "oop.battleStepTurnTitle": "Active Object and Polymorphism",
    "oop.battleStepActionsTitle": "Methods: the heart of objects",
    "oop.battleStepAttackTitle": "Pick a technique!",
    "oop.home.intro":
      "Hey! This game was built to teach Object-Oriented Programming (OOP) in JavaScript in a hands-on way. The idea is simple: as you pick fighters and battle, you will discover real OOP concepts like classes, instances, attributes, methods, constructors, inheritance, and polymorphism. In JavaScript you write all of this using the class keyword, and every concept you see on screen has a direct match in the code. Let's go step by step!",
    "oop.home.slots":
      "In JavaScript, a class is like a mold or template. For example: class Warrior { }. That mold defines what every warrior has and can do. When the game creates Goku or Vegeta, it runs new Warrior('Goku', ...) — that is called an instance: a real object built from the class mold. Each card you see here is a different instance with its own values. When you assign a fighter to Player 1 or Player 2 you are choosing which instances will take part in the battle.",
    "oop.home.roster":
      "Each warrior has attributes: health, energy, defense, a list of techniques. In JavaScript those are declared inside the class — for example, this.health = 2000 inside the constructor. The constructor is the special method that runs when you call new Warrior(...): it is where the object comes to life and its starting values are set. To protect those values, good design uses getters (to read) and setters (to change with rules). That way the object controls its own state and nothing outside can break it without permission.",
    "oop.home.create":
      "When you press Enter combat, the system creates a Battle object. That object uses composition: it does not inherit from Warrior, it contains the fighters — holding references to both inside itself, along with the current turn, health bars, and the action log. Inheritance shows up when a warrior has an evolution (Super Saiyan): that version can extend the base class with extends, inheriting all its attributes and overriding methods to boost damage. The child class reuses the parent's code and only changes what it needs!",
    "oop.home.pickPlayers":
      "Now choose any two warriors from the roster: use the Player 1 and Player 2 buttons on the cards. Each choice connects a concrete instance to a battle role.",
    "oop.home.ready":
      "You picked two Warrior instances. Press Enter combat to build the Battle object; once inside, the guide will continue with turns, methods, and live state.",
    "oop.battle.fighters":
      "These two cards show the internal state of each instance in real time: remaining health, available energy, whether dodge is ready. In OOP, encapsulation protects that state — attributes are not touched directly from outside; they are read through getters (like getHealth()) and changed only through methods that apply the game's rules. That way the object always stays in a valid state, no matter who uses it.",
    "oop.battle.turn":
      "The game knows whose turn it is through an attribute called activeTurn on the Battle object. Notice how the same type of fighter — class Warrior — can act as attacker or defender in different rounds. That is polymorphism: the same attack() method produces different effects depending on who calls it, which technique they use, and how much energy they have at that moment. The behavior changes with the context, without changing the method name.",
    "oop.battle.actionsOop":
      "Every button you press is calling a method on the Battle object: attack(technique), rechargeEnergy(), or prepareEvasion(). In OOP, a method is a function that lives inside the class and can read and change the object's own attributes using this. You never modify attributes directly from outside — you send a message to the object and it decides what to do internally. That is encapsulation in action: the object is in charge of its own behavior.",
    "oop.battle.attack":
      "Each attack card is an element of the active warrior's attacks[] list: an object with a name, damage value, and Ki cost. When you tap one, you call attack(index). The method receives the index, looks up this.attacks[index], checks that Ki is enough, applies the damage formula, and updates the rival's health with this.rival.health -= damage. No one touches those properties from the outside — the object manages everything internally.",
  },
} as const;
