const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const DB_PATH = path.join(__dirname, "../db/tickets.json");

// Helper to read ticket data
async function readTickets() {
  try {
    const data = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Helper to write ticket data
async function writeTickets(tickets) {
  await fs.writeFile(DB_PATH, JSON.stringify(tickets, null, 2), "utf8");
}

// Helper to simulate delay and errors
function processRequest(req, res, next, callback) {
  const delay = parseInt(req.query.delay) || 0;
  const shouldError = req.query.error === "true";

  setTimeout(() => {
    if (shouldError) {
      return res.status(500).json({ error: "Simulated error" });
    }
    callback();
  }, delay);
}

// GET all tickets
router.get("/", (req, res, next) => {
  processRequest(req, res, next, async () => {
    try {
      const tickets = await readTickets();
      res.json(tickets);
    } catch (err) {
      next(err);
    }
  });
});

// GET single ticket
router.get("/:id", (req, res, next) => {
  processRequest(req, res, next, async () => {
    try {
      const tickets = await readTickets();
      const ticket = tickets.find((t) => t.id === parseInt(req.params.id));

      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      res.json(ticket);
    } catch (err) {
      next(err);
    }
  });
});

// POST new ticket
router.post("/", (req, res, next) => {
  processRequest(req, res, next, async () => {
    try {
      const tickets = await readTickets();
      const newId =
        tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1;

      const newTicket = {
        id: newId,
        title: req.body.title,
        description: req.body.description,
        status: req.body.status || "open",
        createdAt: new Date(),
        updatedAt: null,
      };

      tickets.push(newTicket);
      await writeTickets(tickets);

      res.status(201).json(newTicket);
    } catch (err) {
      next(err);
    }
  });
});

// PUT update ticket
router.put("/:id", (req, res, next) => {
  processRequest(req, res, next, async () => {
    try {
      const tickets = await readTickets();
      const index = tickets.findIndex((t) => t.id === parseInt(req.params.id));

      if (index === -1) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const updatedTicket = {
        ...tickets[index],
        title: req.body.title || tickets[index].title,
        description: req.body.description || tickets[index].description,
        status: req.body.status || tickets[index].status,
        updatedAt: new Date(),
      };

      tickets[index] = updatedTicket;
      await writeTickets(tickets);

      res.json(updatedTicket);
    } catch (err) {
      next(err);
    }
  });
});

// DELETE ticket
router.delete("/:id", (req, res, next) => {
  processRequest(req, res, next, async () => {
    try {
      const tickets = await readTickets();
      const filteredTickets = tickets.filter(
        (t) => t.id !== parseInt(req.params.id)
      );

      if (filteredTickets.length === tickets.length) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      await writeTickets(filteredTickets);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });
});

module.exports = router;
