import { useState, useEffect } from 'react';

// Simple translation system without i18n dependency
export const translations = {
  en: {
    dashboard: "Dashboard",
    reports: "Reports",
    dataSource: "Data Sources",
    settings: "Settings",
    carbonEmissions: "Carbon Emissions",
    totalEmissions: "Total Emissions",
    scope1: "Scope 1",
    scope2: "Scope 2", 
    scope3: "Scope 3",
    directEmissions: "Direct Emissions",
    indirectEnergyEmissions: "Indirect Energy Emissions",
    valueChainEmissions: "Value Chain Emissions",
    transactions: "Transactions",
    uploads: "Uploads",
    generateReport: "Generate Report",
    saveSettings: "Save Settings",
    companyName: "Company Name",
    emailAddress: "Email Address",
    language: "Language",
    theme: "Theme",
    currency: "Currency",
    notifications: "Notifications"
  },
  de: {
    dashboard: "Dashboard",
    reports: "Berichte",
    dataSource: "Datenquellen",
    settings: "Einstellungen",
    carbonEmissions: "Kohlenstoff-Emissionen",
    totalEmissions: "Gesamtemissionen",
    scope1: "Scope 1",
    scope2: "Scope 2",
    scope3: "Scope 3",
    directEmissions: "Direkte Emissionen",
    indirectEnergyEmissions: "Indirekte Energieemissionen",
    valueChainEmissions: "Wertschöpfungskettenemissionen",
    transactions: "Transaktionen",
    uploads: "Uploads",
    generateReport: "Bericht erstellen",
    saveSettings: "Einstellungen speichern",
    companyName: "Firmenname",
    emailAddress: "E-Mail-Adresse",
    language: "Sprache",
    theme: "Thema",
    currency: "Währung",
    notifications: "Benachrichtigungen"
  },
  fr: {
    dashboard: "Tableau de bord",
    reports: "Rapports",
    dataSource: "Sources de données",
    settings: "Paramètres",
    carbonEmissions: "Émissions de carbone",
    totalEmissions: "Émissions totales",
    scope1: "Scope 1",
    scope2: "Scope 2",
    scope3: "Scope 3",
    directEmissions: "Émissions directes",
    indirectEnergyEmissions: "Émissions d'énergie indirecte",
    valueChainEmissions: "Émissions de la chaîne de valeur",
    transactions: "Transactions",
    uploads: "Téléchargements",
    generateReport: "Générer un rapport",
    saveSettings: "Sauvegarder les paramètres",
    companyName: "Nom de l'entreprise",
    emailAddress: "Adresse e-mail",
    language: "Langue",
    theme: "Thème",
    currency: "Devise",
    notifications: "Notifications"
  },
  es: {
    dashboard: "Panel de control",
    reports: "Informes",
    dataSource: "Fuentes de datos",
    settings: "Configuración",
    carbonEmissions: "Emisiones de carbono",
    totalEmissions: "Emisiones totales",
    scope1: "Alcance 1",
    scope2: "Alcance 2",
    scope3: "Alcance 3",
    directEmissions: "Emisiones directas",
    indirectEnergyEmissions: "Emisiones indirectas de energía",
    valueChainEmissions: "Emisiones de cadena de valor",
    transactions: "Transacciones",
    uploads: "Subidas",
    generateReport: "Generar informe",
    saveSettings: "Guardar configuración",
    companyName: "Nombre de la empresa",
    emailAddress: "Dirección de correo",
    language: "Idioma",
    theme: "Tema",
    currency: "Moneda",
    notifications: "Notificaciones"
  },
  it: {
    dashboard: "Dashboard",
    reports: "Rapporti",
    dataSource: "Fonti di dati",
    settings: "Impostazioni",
    carbonEmissions: "Emissioni di carbonio",
    totalEmissions: "Emissioni totali",
    scope1: "Ambito 1",
    scope2: "Ambito 2",
    scope3: "Ambito 3",
    directEmissions: "Emissioni dirette",
    indirectEnergyEmissions: "Emissioni indirette di energia",
    valueChainEmissions: "Emissioni della catena del valore",
    transactions: "Transazioni",
    uploads: "Caricamenti",
    generateReport: "Genera rapporto",
    saveSettings: "Salva impostazioni",
    companyName: "Nome dell'azienda",
    emailAddress: "Indirizzo email",
    language: "Lingua",
    theme: "Tema",
    currency: "Valuta",
    notifications: "Notifiche"
  },
  nl: {
    dashboard: "Dashboard",
    reports: "Rapporten",
    dataSource: "Gegevensbronnen",
    settings: "Instellingen",
    carbonEmissions: "Koolstofemissies",
    totalEmissions: "Totale emissies",
    scope1: "Scope 1",
    scope2: "Scope 2",
    scope3: "Scope 3",
    directEmissions: "Directe emissies",
    indirectEnergyEmissions: "Indirecte energie-emissies",
    valueChainEmissions: "Waardeketen emissies",
    transactions: "Transacties",
    uploads: "Uploads",
    generateReport: "Rapport genereren",
    saveSettings: "Instellingen opslaan",
    companyName: "Bedrijfsnaam",
    emailAddress: "E-mailadres",
    language: "Taal",
    theme: "Thema",
    currency: "Valuta",
    notifications: "Meldingen"
  }
};

// Hook to use translations
export function useTranslations() {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('preferred-language') || 'en';
  });

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const t = (key: string) => {
    const currentTranslations = translations[currentLanguage as keyof typeof translations];
    return (currentTranslations as any)?.[key] || key;
  };

  return { t, currentLanguage };
}

export default translations;