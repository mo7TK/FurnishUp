import * as React from 'react';
import AppTheme from '../theme/AppTheme'; // Thème personnalisé
import ColorModeIconDropdown from '../theme/ColorModeIconDropdown'; // Choix du mode clair/sombre
import { useLocation } from 'react-router-dom';
import { confirmCommande } from '../../api'; // Importez la nouvelle fonction
import {
  Box, Button, Card, CardContent, CssBaseline,
  Grid, Stack, Step, StepLabel, Stepper, Typography
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddressForm from './AddressForm'; // Formulaire d’adresse
import Info from './Info'; // Résumé sur grand écran
import InfoMobile from './InfoMobile'; // Résumé sur petit écran
import PaymentForm from './PaymentForm'; // Formulaire de paiement
import Review from './Review'; // Revue de la commande
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useNavigate } from 'react-router-dom';

// Étapes du formulaire
const steps = ['Adresse de livraison', 'Détails de paiement', 'Vérifiez votre commande'];

function getStepContent(step, commandeData, onChange, handlePaymentChange, paymentInfo, errors, setErrors) {
  switch (step) {
    case 0:
      return <AddressForm
        initialValues={commandeData}
        onChange={onChange}
        errors={errors}
        setErrors={setErrors}
      />;
    case 1:
      return <PaymentForm
        onChange={handlePaymentChange}
        errors={errors}
        setErrors={setErrors}
      />;
    case 2:
      return <Review commande={commandeData} paymentInfo={paymentInfo} />;
    default:
      throw new Error('Étape inconnue');
  }
}

export default function Checkout(props) {
  const [activeStep, setActiveStep] = React.useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [errors, setErrors] = React.useState({});
  const [commandeData, setCommandeData] = React.useState(() => {
    return location.state?.commande || {
      _id: null,
      produits: [],
      total: "0.00",
      address: "",
      firstname: "",
      lastname: ""
    };
  });
  const [paymentInfo, setPaymentInfo] = React.useState({});

  const handleChange = (updatedValues) => {
    setCommandeData((prevData) => ({
      ...prevData,
      ...updatedValues,
    }));
  };

  const handlePaymentChange = (paymentData) => {
    setPaymentInfo(paymentData);
    setCommandeData(prev => ({
      ...prev,
      paymentInfo: paymentData
    }));
  };

  // Validation des champs avant de passer à l'étape suivante
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Validation des champs d'adresse - seulement si vide
      if (!commandeData.firstName?.trim()) newErrors.firstName = "Le prénom est requis";
      if (!commandeData.lastName?.trim()) newErrors.lastName = "Le nom de famille est requis";
      if (!commandeData.address1?.trim()) newErrors.address1 = "L'adresse est requise";
      if (!commandeData.city?.trim()) newErrors.city = "La ville est requise";
      if (!commandeData.state?.trim()) newErrors.state = "La région est requise";
      if (!commandeData.zip?.trim()) newErrors.zip = "Le code postal est requis";
      if (!commandeData.country?.trim()) newErrors.country = "Le pays est requis";
    }
    else if (step === 1 && paymentInfo.paymentType === 'creditCard') {
      // Validation des champs de paiement - seulement si vide
      if (!paymentInfo.cardNumber?.trim()) newErrors.cardNumber = "Numéro de carte requis";
      if (!paymentInfo.cvv?.trim()) newErrors.cvv = "CVV requis";
      if (!paymentInfo.cardName?.trim()) newErrors.cardName = "Nom sur la carte requis";
      if (!paymentInfo.expirationDate?.trim()) newErrors.expirationDate = "Date d'expiration requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!commandeData) return <p>Aucune commande reçue.</p>;

  // Passer à l'étape suivante après validation
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  // Revenir à l'étape précédente
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

const handleCommander = async () => {
  try {
    if (!validateStep(activeStep)) return;

    const shippingAddress = {
      address1: commandeData.address1,
      city: commandeData.city,
      state: commandeData.state,
      zip: commandeData.zip,
      country: commandeData.country
    };

    // Confirmer la commande avec l'adresse de livraison
    await confirmCommande(commandeData._id, shippingAddress);
    
    // Passer à l'étape de confirmation
    handleNext();
  } catch (error) {
    console.error("Erreur:", error);
    alert(`Échec: ${error.message}`);
  }
};

  if (!location.state?.commande) {
    console.warn('Aucune donnée de commande dans location.state');
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ColorModeIconDropdown />
      </Box>
      <Grid container sx={{
        height: {
          xs: '100%',
          sm: 'calc(100dvh - var(--template-frame-height, 0px))',
        },
        mt: {
          xs: 4,
          sm: 0,
        },
      }}>
        <Grid
          size={{ xs: 12, sm: 5, lg: 4 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRight: { sm: 'none', md: '1px solid' },
            borderColor: { sm: 'none', md: 'divider' },
            alignItems: 'start',
            pt: 16,
            px: 10,
            gap: 4,
          }}
        >
          <p style={{
             color: 'brown', // Rouge brique
             fontSize: '1.4rem',
             fontWeight: '600',
             fontFamily: 'Arial, sans-serif',
             textTransform: 'uppercase',
             letterSpacing: '1px',
             textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
             padding: '0.5rem 1rem',
             borderRadius: '4px',
             display: 'inline-block'
            }}>
  Furnish up
</p>
          <Box sx={{ p: 2 }}>
            {commandeData ? (
              <Info commande={commandeData} />
            ) : (
              <Typography>Préparation de votre commande...</Typography>
            )}
          </Box>
        </Grid>

        <Grid
          size={{ sm: 12, md: 7, lg: 8 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: { xs: 'transparent', sm: 'background.default' },
            alignItems: 'start',
            pt: { xs: 0, sm: 16 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 },
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: { sm: 'space-between', md: 'flex-end' },
            width: '100%',
            maxWidth: { sm: '100%', md: 600 },
          }}>
            <Stepper
              id="desktop-stepper"
              activeStep={activeStep}
              sx={{ width: '100%', height: 40 }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Card sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Produits sélectionnés
                </Typography>
                <Typography variant="body1">
                  {activeStep >= 2 ? `${commandeData.total} Dz` : `${commandeData.total} Dz`}
                </Typography>
              </div>
              <InfoMobile totalPrice={`${commandeData.total} Dz`} />
            </CardContent>
          </Card>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: { sm: '100%', md: 600 },
            maxHeight: '720px',
            gap: { xs: 5, md: 'none' },
          }}>
            <Stepper
              id="mobile-stepper"
              activeStep={activeStep}
              alternativeLabel
              sx={{ display: { sm: 'flex', md: 'none' } }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === steps.length ? (
              <Stack spacing={2}>
                <Typography variant="h1">📦</Typography>
                <Typography variant="h5">Merci pour votre commande !</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Votre commande est en cours de traitement.
                </Typography>

                <Button variant="contained" onClick={() =>{ navigate("/acheter"); window.location.reload();}}>
                  Accéder à mes commandes
                </Button>
              </Stack>
            ) : (
              <React.Fragment>
                {getStepContent(
                  activeStep,
                  commandeData,
                  handleChange,
                  handlePaymentChange,
                  paymentInfo,
                  errors,
                  setErrors
                )}
                <Box
                  sx={[
                    {
                      display: 'flex',
                      flexDirection: { xs: 'column-reverse', sm: 'row' },
                      alignItems: 'end',
                      gap: 1,
                      pb: { xs: 12, sm: 0 },
                      mt: { xs: 2, sm: 0 },
                      mb: '60px',
                    },
                    activeStep !== 0
                      ? { justifyContent: 'space-between' }
                      : { justifyContent: 'flex-end' },
                  ]}
                >
                  {activeStep !== 0 && (
                    <>
                      <Button
                        startIcon={<ChevronLeftRoundedIcon />}
                        onClick={handleBack}
                        variant="text"
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                      >
                        Précédent
                      </Button>
                      <Button
                        startIcon={<ChevronLeftRoundedIcon />}
                        onClick={handleBack}
                        variant="outlined"
                        fullWidth
                        sx={{ display: { xs: 'flex', sm: 'none' } }}
                      >
                        Précédent
                      </Button>
                    </>
                  )}

                  <Button
                    variant="contained"
                    endIcon={<ChevronRightRoundedIcon />}
                    onClick={async () => {
                      if (activeStep === steps.length - 1) {
                        await handleCommander();
                        handleNext();
                      } else {
                        handleNext();
                      }
                    }}
                    sx={{
                      width: { xs: '100%', sm: 'fit-content' }
                    }}
                  >
                    {activeStep === steps.length - 1 ? (
                      <>
                        Commander <ShoppingCartCheckoutIcon sx={{ ml: 1 }} />
                      </>
                    ) : (
                      'Suivant'
                    )}
                  </Button>
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}