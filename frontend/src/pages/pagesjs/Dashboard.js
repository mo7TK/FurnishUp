import React, { useEffect, useState } from "react";
import { getProduitsAValider, getCommandeenattente, getTotalUtilisateurs, getProfitAdmin, getProfitAutres }from "../../api";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend, ResponsiveContainer
} from 'recharts';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import "../pagescss/Dashboard.css";
import Sidebar from '../../components/componentjs/Sidebar';
import Chatbot from '../../components/componentjs/Chatbot'
import { FaUser } from "react-icons/fa"; 

const Dashboard = () => {
  const [stats, setStats] = useState({
    produitsAValider: 0,
    commandesEnAttente: 0,
    totalUtilisateurs: 0,
    totalProduits: 0,
    totalCommandes: 0,
  });

  const [profits, setProfits] = useState({
    admin: 0,
    commission: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const produitsData = await getProduitsAValider();
        const commandesData = await getCommandeenattente();
        const utilisateursData = await getTotalUtilisateurs();
        const profitAdmin = await getProfitAdmin();
        const profitAutres = await getProfitAutres();

        setStats({
          produitsAValider: produitsData.produitsAValider,
          commandesEnAttente: commandesData.commandesEnAttente,
          totalUtilisateurs: utilisateursData.totalUtilisateurs,
          totalProduits: produitsData.totalProduits,
          totalCommandes: commandesData.totalCommandes,
        });

        setProfits({
          admin: profitAdmin.profitAdmin || 0,
          commission: profitAutres.commission || 0,
        });
      } catch (err) {
        console.error("Erreur de récupération des statistiques :", err);
      }
    };

    fetchStats();
  }, []);

  const dataProduits = [
    {
      name: "Produits à valider",
      value: stats.produitsAValider,
      fill: "rgb(112, 2, 50)",

    },
    {
      name: "Autres Produits",
      value: stats.totalProduits - stats.produitsAValider,
      fill: "#d4d4d4",
    },
  ];

  const dataCommandes = [
    {
      name: "Commandes en attente",
      value: stats.commandesEnAttente,
      fill: "brown",
    },
    {
      name: "Autres Commandes",
      value: stats.totalCommandes - stats.commandesEnAttente,
      fill: "#d4d4d4",
    },
  ];

  const dataBar = [
    { name: "Produits à valider", value: stats.produitsAValider },
    { name: "Commandes en attente", value: stats.commandesEnAttente },
    { name: "Utilisateurs", value: stats.totalUtilisateurs },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Tableau de bord</h1>

        <div className="stats two-col">
          <div className="card card-small add">
            <h3 className="text-profit">Profit Admin</h3>
            <div className="utilisateur-box">
              <span className="count text-profit">
                {profits.admin.toFixed(2)} Da
              </span>
              <span className="label text-profit">Profit total</span>
            </div>
          </div>

          <div className="card card-small autreprofit">
            <h3 className="text-profit">Commission sur ventes</h3>
            <div className="utilisateur-box">
              <span className="count text-profit">
                {profits.commission.toFixed(2)} Da
              </span>
              <span className="label text-profit">Commission totale</span>
            </div>
          </div>
        </div>

        <div className="stats three-col">
          <div className="card">
            <h3>🛒 Produits à valider</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataProduits}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {dataProduits.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <PieTooltip />
                <PieLegend />
              </PieChart>
            </ResponsiveContainer>
            <p>{stats.produitsAValider} produits à valider</p>
          </div>

          <div className="card">
            <h3>📦 Commandes en attente</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataCommandes}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {dataCommandes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <PieTooltip />
                <PieLegend />
              </PieChart>
            </ResponsiveContainer>
            <p>{stats.commandesEnAttente} commandes en attente</p>
          </div>
 <div className="card">
      <h3>
        <FaUser style={{ marginRight: "8px", color: "#B22222" }} /> 
        Utilisateurs
      </h3>
      <div className="utilisateur-box">
        <FaUser 
          className="icon" 
          style={{ 
            color: "#B22222", // Rouge brique
            fontSize: "3.9em",
            marginRight: "8px" 
          }} 
        />
        <span className="count">{stats.totalUtilisateurs}</span>
        <span className="label">personnes</span>
      </div>
    </div>
</div>

        <div className="bar-chart-container">
          <h3>Statistiques Globales</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dataBar}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="url(#colorBar)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgb(212, 70, 70)" />
                  <stop offset="100%" stopColor="#d4d4d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default Dashboard;