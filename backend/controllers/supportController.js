import {
  createTicket as insertTicket,
  findTickets,
  getTicketById,
  updateTicket as patchTicket,
} from '../models/supportTickets.js';

export const createTicket = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.',
      });
    }

    const ticket = await insertTicket({
      userId: req.user ? req.user._id : null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully. Our team will contact you shortly.',
      ticket,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit support request.',
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const tickets = await findTickets(status === 'all' ? null : status);

    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tickets.',
    });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const patch = {};
    if (['open', 'in_progress', 'resolved'].includes(status)) patch.status = status;
    if (adminResponse !== undefined) patch.adminResponse = String(adminResponse);
    if (status === 'resolved') patch.resolvedAt = new Date();

    await patchTicket(ticket, patch);

    res.json({
      success: true,
      message: 'Ticket updated successfully.',
      ticket,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket.',
    });
  }
};
