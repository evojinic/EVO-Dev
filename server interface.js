app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
        'INSERT INTO Users (FirstName, LastName, Email, PasswordHash) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, hashedPassword]
    );
    res.sendStatus(201);
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM Users WHERE Email = ?',
        [email]
    );
    if (rows.length === 0) return res.sendStatus(401);
    const user = rows[0];
    if (await bcrypt.compare(password, user.PasswordHash)) {
        const token = jwt.sign({ userId: user.UserID }, 'your_secret_key');
        res.json({ token });
    } else {
        res.sendStatus(401);
    }
});
