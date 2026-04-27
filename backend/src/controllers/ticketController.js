import pool from "../config/db.js";

import { getOneTicket, getAllTicket, getDateTicket, addTicket, updateTicket, archiveTicket  } from "../models/ticketModel.js";

export const getTicketByID = (req, res) => {
    const { id } = req.params;
    getOneTicket(id, (err, appel) => {
      if (err) return res.status(500).json({ message: "Erreur de chargement de l'appel", error: err.message });
      if (!appel || appel.length === 0) return res.status(404).json({ message: "Ticket non trouvée" });
      res.status(200).json(appel[0]); 
    });
};

export const getTicket = (req, res) => {
    getAllTicket((err, appel) => {
        if (err) return res.status(500).json({ message: "Erreur de chargement des appels", error: err.message });
        res.status(200).json(appel);
      });
};

export const getTicketByDate= (req, res) => {
    const { dateDebut, dateFin } = req.query
    getDateTicket((err, appels) => {
        if (err) return res.status(500).json({ message: "Erreur de chargement des appels", error: err.message });
        res.status(200).json(appels);
    }, dateDebut, dateFin)
};

export const createTicket = (req, res) => {
    const data = req.body;
    addTicket(data, (err, appel) => {
        if (err) return res.status(500).json({ message: "Erreur lors de l'ajout", error: err.message });
        res.status(200).json({ message: "Ticket ajoutée avec succès", id: appel.insertId });
      });

};

export const editTicket = (req, res) => {
    const data = { ...req.body };
    console.log("Data reçue pour mise à jour du ticket:", data);
    console.log("ID du ticket à mettre à jour:", req.params.id);
    if (req.params && req.params.id) data.id = req.params.id;
    updateTicket(data, (err, appel) => {
      if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
      if (appel.affectedRows === 0) return res.status(404).json({ message: "Ticket non trouvée" });
      res.status(200).json({ message: "Ticket mise à jour", affectedRows: appel.affectedRows });
    });
};

export const deleteTicket = (req, res) => {
    const {id} = req.params;
    archiveTicket(id, (err, appel) => {
        if (err) return res.status(500).json({ message: "Erreur de suppression de l'appel", error: err.message });
        res.status(200).json({ message: "Ticket archivé avec succès"})
    });
};
