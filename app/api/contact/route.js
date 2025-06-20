// app/api/contact/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create email transporter
function createEmailTransporter() {
  return nodemailer.createTransport({  // Fixed: createTransport instead of createTransporter
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Bypass SSL certificate issues (only for debugging)
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Send contact form email to admin
async function sendContactEmail(formData) {
  try {
    // Create email transporter
    const transporter = createEmailTransporter();

    // Format the current date
    const currentDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create the email HTML for admin
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0d9488; margin: 0;">Koncept Services</h1>
          <p style="color: #666;">New Contact Form Submission</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Contact Details</h2>
          <p><strong>Date:</strong> ${currentDate}</p>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <p><strong>Subject:</strong> ${formData.subject}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Message</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #0d9488;">
            <p style="margin: 0; line-height: 1.6;">${formData.message}</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0; color: #666; text-align: center;">This email was sent from the Koncept Services contact form.</p>
        </div>
      </div>
    `;

    // Send the email with comprehensive logging
    console.log('Attempting to send contact email:', {
      from: `"Koncept Services" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact: ${formData.subject} - ${formData.name}`
    });

    const info = await transporter.sendMail({
      from: `"Koncept Services" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact: ${formData.subject} - ${formData.name}`,
      html: emailHtml,
      replyTo: formData.email
    });

    console.log('Contact email sent successfully:', {
      messageId: info.messageId,
      response: info.response
    });

    return true;
  } catch (error) {
    // Comprehensive error logging
    console.error('Contact Email Sending Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    return false;
  }
}

export async function POST(request) {
  try {
    // Get form data from request
    const formData = await request.json();
    
    // Validate required fields
    const { name, email, phone, subject, message } = formData;
    
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Send email to admin
    const emailSent = await sendContactEmail(formData);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully'
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form', details: error.message },
      { status: 500 }
    );
  }
}