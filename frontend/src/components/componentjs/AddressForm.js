import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';

// Composant personnalisé pour le layout des champs du formulaire
const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

// Composant principal : formulaire d'adresse
export default function AddressForm({ onChange, initialValues = {}, errors = {}, setErrors }) {
  // Utilisation des données de commande comme valeurs initiales
  const [firstName, setFirstName] = React.useState(initialValues.firstname || '');
  const [lastName, setLastName] = React.useState(initialValues.lastname || '');
  const [address1, setAddress1] = React.useState(initialValues.address || '');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [zip, setZip] = React.useState('');
  const [country, setCountry] = React.useState('Algerie');
  const [saveAddress, setSaveAddress] = React.useState(false);

  // Fonction qui gère les changements dans tous les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value,checked } = e.target;

    // Mise à jour de l'état correspondant au champ modifié
    if (name === 'firstName') setFirstName(value);
    if (name === 'lastName') setLastName(value);
    if (name === 'address1') setAddress1(value);
    if (name === 'city') setCity(value);
    if (name === 'state') setState(value);
    if (name === 'zip') setZip(value);
    if (name === 'country') setCountry(value);
    if (name === 'saveAddress') setSaveAddress(checked); // Utilisez checked pour les checkbox

    // Effacer l'erreur quand l'utilisateur commence à taper
    if (value && errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Envoi des données modifiées au parent si une fonction de rappel est fournie
    onChange({
      firstName,
      lastName,
      address1,
      city,
      state,
      zip,
      country,
      saveAddress: name === 'saveAddress' ? checked : saveAddress // Mise à jour correcte de saveAddress

    });
  };

  return (
    // Grille responsive MUI avec des espacements
    <Grid container spacing={3}>
      {/* Champ prénom */}
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="first-name" required>
          Prénom
        </FormLabel>
        <OutlinedInput
          id="first-name"
          name="firstName"
          value={firstName}
          onChange={handleInputChange}
          placeholder="Jean"
          autoComplete="prénom"
          required
          size="small"
          error={!!errors.firstName && !firstName.trim()}
        />
        {errors.firstName &&  !firstName.trim() && <FormHelperText error>{errors.firstName}</FormHelperText>}
      </FormGrid>

      {/* Champ nom de famille */}
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="last-name" required>
          Nom de famille
        </FormLabel>
        <OutlinedInput
          id="last-name"
          name="lastName"
          value={lastName}
          onChange={handleInputChange}
          placeholder="Dupont"
          autoComplete="nom de famille"
          required
          size="small"
          error={!!errors.lastName && !lastName.trim()}
        />
        {errors.lastName &&  !lastName.trim() && <FormHelperText error>{errors.lastName}</FormHelperText>}
      </FormGrid>

      {/* Champ adresse ligne 1 */}
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="address1" required>
          Adresse ligne 1
        </FormLabel>
        <OutlinedInput
          id="address1"
          name="address1"
          value={address1}
          onChange={handleInputChange}
          placeholder="Nom de rue et numéro"
          autoComplete="adresse-ligne1"
          required
          size="small"
          error={!!errors.address1 && !address1.trim()}
        />
        {errors.address1 &&  !address1.trim() &&<FormHelperText error>{errors.address1}</FormHelperText>}
      </FormGrid>

      {/* Champ ville */}
      <FormGrid size={{ xs: 6 }}>
        <FormLabel htmlFor="city" required>
          Ville
        </FormLabel>
        <OutlinedInput
          id="city"
          name="city"
          value={city}
          onChange={handleInputChange}
          placeholder="Paris"
          autoComplete="ville"
          required
          size="small"
          error={!!errors.city && !city.trim()}
        />
        {errors.city &&  !city.trim() && <FormHelperText error>{errors.city}</FormHelperText>}
      </FormGrid>

      {/* Champ état / région */}
      <FormGrid size={{ xs: 6 }}>
        <FormLabel htmlFor="state" required>
          État / Région
        </FormLabel>
        <OutlinedInput
          id="state"
          name="state"
          value={state}
          onChange={handleInputChange}
          placeholder="Île-de-France"
          autoComplete="état"
          required
          size="small"
          error={!!errors.state && !state.trim()}
        />
        {errors.state &&  !state.trim() &&<FormHelperText error>{errors.state}</FormHelperText>}
      </FormGrid>

      {/* Champ code postal */}
      <FormGrid size={{ xs: 6 }}>
        <FormLabel htmlFor="zip" required>
          Code postal
        </FormLabel>
        <OutlinedInput
          id="zip"
          name="zip"
          value={zip}
          onChange={handleInputChange}
          placeholder="75000"
          autoComplete="code-postal"
          required
          size="small"
          error={!!errors.zip && !zip.trim()}
        />
        {errors.zip &&  !zip.trim() &&<FormHelperText error>{errors.zip}</FormHelperText>}
      </FormGrid>

      {/* Champ pays */}
      <FormGrid size={{ xs: 6 }}>
        <FormLabel htmlFor="country" required>
          Pays
        </FormLabel>
        <OutlinedInput
          id="country"
          name="country"
          value={country}
          onChange={handleInputChange}
          placeholder="France"
          autoComplete="pays"
          required
          size="small"
          error={!!errors.country && !country.trim()}
        />
        {errors.country &&  !country.trim() &&<FormHelperText error>{errors.country}</FormHelperText>}
      </FormGrid>

      {/* Case à cocher pour enregistrer l'adresse */}
      <FormGrid size={{ xs: 12 }}>
        <FormControlLabel
          control={
            <Checkbox
              name="saveAddress"
              checked={saveAddress}
              onChange={handleInputChange}
            />
          }
          label="Utiliser cette adresse pour les détails de paiement"
        />
      </FormGrid>
    </Grid>
  );
}