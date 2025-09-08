const express = require("express");
const router = express.Router();
const scheduledServiceController = require("../controllers/scheduledServiceController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Agenda
 *     description: Gerenciamento de serviços agendados
 */

/**
 * @swagger
 * /scheduled-services:
 *   post:
 *     summary: Cria um novo serviço agendado (evento)
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServicoAgendado'
 *     responses:
 *       201:
 *         description: Evento criado com sucesso.
 */
router.post(
    "/scheduled-services",
    authMiddleware,
    scheduledServiceController.createScheduledService
);

/**
 * @swagger
 * /scheduled-services:
 *   get:
 *     summary: Lista todos os serviços agendados do usuário
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServicoAgendado'
 */
router.get(
    "/scheduled-services",
    authMiddleware,
    scheduledServiceController.getScheduledServicesByUserId
);

/**
 * @swagger
 * /scheduled-services/{id}:
 *   put:
 *     summary: Atualiza um serviço agendado
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServicoAgendado'
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso.
 *       404:
 *         description: Evento não encontrado.
 */
router.put(
    "/scheduled-services/:id",
    authMiddleware,
    scheduledServiceController.updateScheduledService
);

/**
 * @swagger
 * /scheduled-services/{id}:
 *   delete:
 *     summary: Deleta um serviço agendado
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Evento deletado com sucesso.
 *       404:
 *         description: Evento não encontrado.
 */
router.delete(
    "/scheduled-services/:id",
    authMiddleware,
    scheduledServiceController.deleteScheduledService
);

/**
 * @swagger
 * /scheduled-services/{id}:
 *   get:
 *     summary: Obtém um serviço agendado pelo ID
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Dados do evento.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoAgendado'
 *       404:
 *         description: Evento não encontrado.
 */
router.get(
    "/scheduled-services/:id",
    authMiddleware,
    scheduledServiceController.getScheduledServiceById
);

module.exports = router;
