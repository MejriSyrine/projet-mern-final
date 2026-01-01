import React, { useState } from 'react';
// Fichier CSS pour le style

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ici vous pouvez ajouter l'envoi du formulaire par email
        console.log('Formulaire envoyé:', formData);
        alert('Merci pour votre message ! Nous vous répondrons bientôt.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1>Contactez-Nous</h1>
                <p>Des questions sur les recettes sans gluten ? Nous sommes là pour vous aider !</p>
            </div>

            <div className="contact-content">
                <div className="contact-info">
                    <h2>📞 Informations de Contact</h2>
                    
                    <div className="contact-item">
                        <div className="icon">📧</div>
                        <div>
                            <h3>Email</h3>
                            <p>rejaibiislem79@gmail.com</p>
                        </div>
                    </div>

                    <div className="contact-item">
                        <div className="icon">📱</div>
                        <div>
                            <h3>Téléphone</h3>
                            <p>+216 94256794</p>
                        </div>
                    </div>

                    <div className="contact-item">
                        <div className="icon">🕒</div>
                        <div>
                            <h3>Horaires d'ouverture</h3>
                            <p>Lun - Ven: 9h00 - 18h00</p>
                            <p>Samedi: 10h00 - 16h00</p>
                        </div>
                    </div>

                    <div className="contact-item">
                        <div className="icon">📍</div>
                        <div>
                            <h3>Adresse</h3>
                            <p>123 Avenue des Recettes<br />75001 Paris, France</p>
                        </div>
                    </div>

                    <div className="social-links">
                        <h3>Suivez-nous</h3>
                        <div className="social-icons">
                            <a href="#" className="social-icon">📘</a>
                            <a href="#" className="social-icon">📷</a>
                            <a href="#" className="social-icon">🐦</a>
                            <a href="#" className="social-icon">📺</a>
                        </div>
                    </div>
                </div>

                <div className="contact-form">
                    <h2>✉️ Envoyez-nous un message</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Nom complet *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">Sujet *</label>
                            <select
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Choisissez un sujet</option>
                                <option value="recipe-question">Question sur une recette</option>
                                <option value="allergy-info">Information sur les allergies</option>
                                <option value="technical-issue">Problème technique</option>
                                <option value="partnership">Partenariat</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="6"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Décrivez votre question ou préoccupation..."
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn">
                            Envoyer le message
                        </button>
                    </form>
                </div>
            </div>

            <div className="faq-section">
                <h2>❓ Questions Fréquentes</h2>
                <div className="faq-grid">
                    <div className="faq-item">
                        <h3>Comment remplacer la farine de blé ?</h3>
                        <p>Nous recommandons des mélanges de farines sans gluten comme la farine de riz, de sarrasin, ou des mélanges prêts à l'emploi.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Vos recettes sont-elles certifiées sans gluten ?</h3>
                        <p>Toutes nos recettes sont conçues sans gluten, mais nous recommandons de vérifier les emballages des ingrédients.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Puis-je soumettre ma propre recette ?</h3>
                        <p>Oui ! Utilisez le formulaire ci-dessus pour nous envoyer vos créations sans gluten.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;