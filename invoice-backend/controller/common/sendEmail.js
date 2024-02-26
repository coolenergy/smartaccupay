const nodemailer = require('nodemailer');
let config = require("./../../config/config");
async function sendEmail(from, to, subject, html) {
    let smtpOptions = {
        host: config.smartaccupay_tenants.tenant_smtp_server,
        port: config.smartaccupay_tenants.tenant_smtp_port,
        auth: {
            user: config.smartaccupay_tenants.tenant_smtp_username,
            pass: config.smartaccupay_tenants.tenant_smtp_password
        }
    };
    const transporter = nodemailer.createTransport(smtpOptions);
    let mailvalue = await transporter.sendMail({ from, to, subject, html });
    return mailvalue;
}

async function sendEmail_client(from, to, subject, html, tenant_smtp_server, tenant_smtp_port,
    tenant_smtp_reply_to_mail, tenant_smtp_password, tenant_smtp_timeout, tenant_smtp_security) {
    if (to.length == 0) return null;
    let smtpOptions = {
        host: tenant_smtp_server,
        port: tenant_smtp_port,
        connectionTimeout: tenant_smtp_timeout * 10000,
        auth: {
            user: from,
            pass: tenant_smtp_password,
            replyTo: tenant_smtp_reply_to_mail,
        }
    };
    let replyTo = tenant_smtp_reply_to_mail;
    const transporter = nodemailer.createTransport(smtpOptions);
    let mailvalue = await transporter.sendMail({ from, to, subject, html, replyTo });
    return mailvalue;
}

//send invoice
async function sendEmail_client_invoice(from, to, cc, subject, html, tenant_smtp_server, tenant_smtp_port,
    tenant_smtp_reply_to_mail, tenant_smtp_password, tenant_smtp_timeout, tenant_smtp_security) {
    if (to.length == 0) return null;
    let smtpOptions = {
        host: tenant_smtp_server,
        port: tenant_smtp_port,
        connectionTimeout: tenant_smtp_timeout * 10000,
        auth: {
            user: from,
            pass: tenant_smtp_password,
            replyTo: tenant_smtp_reply_to_mail,
        }
    };
    let replyTo = tenant_smtp_reply_to_mail;
    const transporter = nodemailer.createTransport(smtpOptions);
    let mailvalue = await transporter.sendMail({ from, to, cc, subject, html, replyTo });
    return mailvalue;
}

async function sendEmail_client_with_attachment(from, to, subject, html, tenant_smtp_server, tenant_smtp_port,
    tenant_smtp_reply_to_mail, tenant_smtp_password, tenant_smtp_timeout, tenant_smtp_security, attachments) {
    let smtpOptions = {
        host: tenant_smtp_server,
        port: tenant_smtp_port,
        connectionTimeout: tenant_smtp_timeout * 10000,
        auth: {
            user: from,
            pass: tenant_smtp_password,
            replyTo: tenant_smtp_reply_to_mail,
        }
    };
    let replyTo = tenant_smtp_reply_to_mail;
    const transporter = nodemailer.createTransport(smtpOptions);
    let mailvalue = await transporter.sendMail({ from, to, subject, html, replyTo, attachments });
    return mailvalue;
}


module.exports = {
    sendEmail, sendEmail_client, sendEmail_client_with_attachment, sendEmail_client_invoice
};