import SupportTicket from '../models/SupportTicket.js';

export const createTicket = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.',
      });
    }

    const ticket = new SupportTicket({
      userId: req.user ? req.user._id : undefined,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
      status: 'open',
    });

    await ticket.save();

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
    const query = status === 'all' ? {} : { status };

    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });

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

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (status) ticket.status = status;
    if (adminResponse !== undefined) ticket.adminResponse = adminResponse;
    if (status === 'resolved') ticket.resolvedAt = new Date();

    await ticket.save();

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
