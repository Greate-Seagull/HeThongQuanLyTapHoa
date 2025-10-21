export class LoginController {
    constructor(usecase) {
        this.usecase = usecase;
    }

    async execute(req, res) {
        try {
            await result = this.usecase.execute(req.body);
            res.json({ token: result });
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}