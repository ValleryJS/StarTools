// /api/user-counter.js
let activeUsers = 0;

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Increment the counter when a user connects
        activeUsers++;
        res.status(200).json({ activeUsers });
    } else if (req.method === 'DELETE') {
        // Decrement the counter when a user disconnects
        activeUsers = Math.max(0, activeUsers - 1);
        res.status(200).json({ activeUsers });
    } else {
        // Return the current count
        res.status(200).json({ activeUsers });
    }
}
