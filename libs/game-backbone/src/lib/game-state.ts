export class GameState {
    protected turn = 1
    protected state: Map<number, number> = new Map()
    protected ready = false

    constructor(
        protected numberOfPlayers: number,
        public readonly turnId: number,
        public readonly userId: number
    ) {}

    nextTurn() {
        this.turn = ((this.turn + 1) % this.numberOfPlayers) + 1
    }

    setTurn(turn: number) {
        if (turn > this.numberOfPlayers) return
        this.turn = turn
    }

    isMyTurn(turn?: number): boolean {
        return this.turn === (turn ?? this.turnId)
    }

    getState(key: number): number | undefined {
        return this.state.get(key)
    }

    setState(key: number, value: number) {
        this.state.set(key, value)
    }

    isReady(): boolean {
        return this.ready
    }

    setReady() {
        this.ready = true
    }

    getNumberOfPlayers(): number {
        return this.numberOfPlayers
    }
}
