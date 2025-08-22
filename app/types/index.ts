export type Move = {
    id: string;
    name: string;
    categories: string[];
    roles: string[];
    effects: string[];
    affectedStats: { stat: string; amount: number }[];
    affectedStats2: { stat: string; amount: number }[];
    power: number;
    accuracy: number;
    healamount: number
    targetTypes: string[];
    duration: number;
    moveType: "physical" | "special";
    contact: boolean;
    exceptionHandler?: string;
    moveSound?: string;
    animation?: string;
    relatedCharacters: string[];
    description?: string;
    createdAt: string;
    updatedAt: string;
  };

  export type Deck = {
    deckid: string;
    player: "Player 1" | "Player 2";
    character: Character & { selectedMoves: any[] };
    maxHP: number;
    currentStats: any;
  }

  export type PlayerType = "Player 1" | "Player 2";
  
  export type Ability = { name: string; description: string };
  export type Character = {
    id: number;
    name: string;
    title: string;
    universe: string;
    image: string;
    stats: { hp: number; attack: number; defense: number; speed: number };
    movePool: Move[];
    abilities: { special: Ability; hidden: Ability };
    theme: { primaryColor: string; secondaryColor: string; borderColor: string; glowColor: string };
  };

export type TargetDetails = {
    deckid: string;
    character: Character;
    player: "Player 1" | "Player 2";
    targetIndex: number; // index of the active slot at selection time (0..)
  };
  
export type SelectedMove = {
    deckid: string; // deckid of the move maker card
    player: "Player 1" | "Player 2";
    moveMaker: Character;
    targets: TargetDetails[];
    move: Move;
  };
  
export type StatEffect = {
    id: string;
    moveDetails: Move;
    affectedStats: { stat: string; amount: number }[];
    duration: number;
    targets: TargetDetails[];
  };

  
export type GameState = {
  player1Deck: Deck[];
  player2Deck: Deck[];
  faintedPlayer1: { [key: string]: boolean };
  faintedPlayer2: { [key: string]: boolean };
  activePlayer1Count: number;
  activePlayer2Count: number;
  turn: "Player 1" | "Player 2";
  selectedMoves: SelectedMove[];
  glowingCards: { moveMaker: string | null; targets: string[] };
  round: number;
  teamsLoaded: boolean;
  processingMoves: boolean;
};