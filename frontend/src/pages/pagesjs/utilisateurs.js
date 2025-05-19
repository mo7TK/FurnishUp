import React, { useState, useEffect } from 'react';
import { getAllUtilisateurs, deleteUtilisateur } from "../../api";
import { Table, Space, Spin, message, Modal } from 'antd';
import Sidebar from '../../components/componentjs/Sidebar';
import  "../pagescss/utilisateurs.css";
import { useNavigate , useNavigation } from 'react-router-dom';
const { confirm } = Modal;

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const ADMIN_ID = "67d58664c14a211ded9e25ed"; // À remplacer par votre variable d'environnement
  const navigate = useNavigate();

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      const data = await getAllUtilisateurs();
      setUtilisateurs(data);
    } catch (error) {
      message.error('Erreur lors du chargement des utilisateurs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = (userId) => {
    if (userId === ADMIN_ID) {
      message.warning("Impossible de supprimer le compte administrateur");
      return;
    }

    confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cet utilisateur et tous ses produits?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        return deleteUser(userId);
      },
    });
  };

  const deleteUser = async (userId) => {
    try {
      await deleteUtilisateur(userId);
      message.success('Utilisateur supprimé avec succès');
      fetchUtilisateurs(); // Rafraîchir la liste
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Prénom',
      dataIndex: 'lastname',
      key: 'lastname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nombre de produits',
      dataIndex: 'nombre_produits',
      key: 'nombre_produits',
      sorter: (a, b) => a.nombre_produits - b.nombre_produits,
    },
    // Dans la colonne "Action" du tableau
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => navigate(`/profil/${record._id}`)}>Voir</a>
          <a
            className='supp'
            onClick={() => handleDelete(record._id)}
          >
            Supprimer
          </a>
        </Space>
      ),
    }
  ];

  return (
    <div className="utilisateurs-container">
      <Sidebar />
      <div className="content">
        <h1>Liste des Utilisateurs</h1>
        {loading ? (
          <div className="spinner-container">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={utilisateurs}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </div>
  );
};

export default Utilisateurs;



