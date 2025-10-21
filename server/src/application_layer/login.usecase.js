import jwt from "jsonwebtoken"

export class LoginUsecase {
    static get LOGIN_ERROR_MESSAGE() { return "Invalid username or password"; }

    constructor(userRepository, tokenRepository, jwtSecret, jwtExpiry) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.jwtSecret = jwtSecret;
        this.jwtExpiry = jwtExpiry;
    }

    async execute({ username, password }) {
        const user = this.userRepository.findByName(username);
        if (!user) throw new Error(LoginUsecase.LOGIN_ERROR_MESSAGE);

        const isPasswordValid = user.matchPassword(password);
        if (!isPasswordValid) throw new Error(LoginUsecase.LOGIN_ERROR_MESSAGE);

        const token = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: this.jwtExpiry });
        return token
    }
}