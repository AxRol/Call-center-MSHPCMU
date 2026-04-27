import pool from "../config/db.js";

import { getOneAppel, getAllAppel, getDateAppel, addAppel, updateAppel, archiveAppel  } from "../models/formulaire_appelModel.js";
import {addTicket} from "../models/ticketModel.js";

export const getAppelByID = (req, res) => {
    const { id } = req.params;
    getOneAppel(id, (err, appel) => {
      if (err) return res.status(500).json({ message: "Erreur de chargement de l'appel", error: err.message });
      if (!appel || appel.length === 0) return res.status(404).json({ message: "Appel non trouvée" });
      res.status(200).json(appel[0]); 
    });
};

export const getAppel = (req, res) => {
    getAllAppel((err, appel) => {
        if (err) return res.status(500).json({ message: "Erreur de chargement des appels", error: err.message });
        res.status(200).json(appel);
      });
};

export const getAppelByDate= (req, res) => {
    const { dateDebut, dateFin } = req.query
    getDateAppel((err, appels) => {
        if (err) return res.status(500).json({ message: "Erreur de chargement des appels", error: err.message });
        res.status(200).json(appels);
    }, dateDebut, dateFin)
}

/* export const createAppel = (req, res) => {
    const data = req.body;
    addAppel(data, (err, appel) => {
        if (err) return res.status(500).json({ message: "Erreur lors de l'ajout", error: err.message });
         res.status(200).json({ message: "Appel ajoutée avec succès", uid: appel.uid });
      });
         
}; */

export const createAppel = (req, res) => {
  const data = req.body

  addAppel(data, (err, appel) => {
    if (err) { return res.status(500).json({success: false, message: 'Erreur lors de l\'enregistrement de l\'appel',  error: err.message }) }
    const appelInsere = appel.rows[0]
    return res.status(201).json({ success: true, message: 'Appel enregistré avec succès', appel_id: appelInsere.uid })
  })
}

export const editAppel = (req, res) => {
    const data = { ...req.body };
    if (req.params && req.params.id) data.id = req.params.id;
    updateAppel(data, (err, appel) => {
      if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
      if (appel.affectedRows === 0) return res.status(404).json({ message: "Appel non trouvée" });
      res.status(200).json({ message: "Appel mise à jour", affectedRows: appel.affectedRows });
    });
};

export const deleteAppel = (req, res) => {
    const {id} = req.params;
    archiveAppel(id, (err, appel) => {
        if (err) return res.status(500).json({ message: "Erreur de suppression de l'appel", error: err.message });
        res.status(200).json({ message: "Appel archivé avec succès"})
    });
};
