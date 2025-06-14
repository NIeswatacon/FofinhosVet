import React, { useState } from 'react';
import axios from 'axios';
import styles from './AddProductModal.module.css';

interface AddProductModalProps {
    isVisible: boolean;
    onClose: () => void;
    onProductAdded: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isVisible, onClose, onProductAdded }) => {
    const [formData, setFormData] = useState({
        nome: '',
        preco: '',
        tipo: 'RACAO',
        descricao: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                'https://microservicevendas-production.up.railway.app/produtos',
                {
                    ...formData,
                    preco: parseFloat(formData.preco)
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                onProductAdded();
                onClose();
                setFormData({
                    nome: '',
                    preco: '',
                    tipo: 'RACAO',
                    descricao: ''
                });
            }
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            alert('Erro ao adicionar produto. Por favor, tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Adicionar Novo Produto</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="nome">Nome do Produto:</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="preco">Preço:</label>
                        <input
                            type="number"
                            id="preco"
                            name="preco"
                            value={formData.preco}
                            onChange={handleChange}
                            step="0.01"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="tipo">Tipo:</label>
                        <select
                            id="tipo"
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            required
                        >
                            <option value="RACAO">Ração</option>
                            <option value="REMEDIO">Remédio</option>
                            <option value="BRINQUEDO">Brinquedo</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="descricao">Descrição:</label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adicionando...' : 'Adicionar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal; 