import { Container, Box } from '@mui/material';
import HomeIMG from '../assets/images/HomeIMG.png';

const HomeContent = () => {
  return (
    <Container maxWidth={false} sx={{ // maxWidth comme prop, pas string
      px: { xs: 2, sm: 3 },
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: 'center',
      gap: 4,
      mt: 3,
      minHeight: '90vh' // Pour visualisation
    }}>
      <HomeText />
      <Box sx={{ flex: 1, textAlign: 'center' }}>
        <img 
          src={HomeIMG} 
          alt="HomeIMG" 
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            display: 'block' // Important pour les images
          }}
        />
      </Box>
    </Container>
  );
};

const HomeText = () => {
  return (
    <Box sx={{ flex: 1 }} component="div"> {/* Conversion en Box */}
      <Box component="h2" sx={{ fontSize: '2rem', mb: 2 }}>
        Trouvez votre partenaire idéal dès maintenant !
      </Box>
      <Box component="p" sx={{ mb: 2 }}>
        Dans un monde où le travail en ligne prend de plus en plus d'importance,
        notre plateforme est la solution idéale pour mettre en relation les
        entreprises et les freelancers qualifiés.
      </Box>
            <p>
        <strong>Comment ça marche ?</strong> <br />
        1️⃣ <strong>Clients</strong> : Publiez vos projets, recevez des propositions. <br />
        2️⃣ <strong>Freelancers</strong> : Trouvez des missions, postulez en 1 clic. <br />
        3️⃣ <strong>Ensemble</strong> : Collaborez et réussissez facilement. <br />
      </p>
      <p>
        <strong>Pourquoi nous choisir ?</strong> <br />
        ✔ Pour les clients : Des talents vérifiés, gain de temps. <br />
        ✔ Pour les freelancers : Des projets variés. <br />
        ✔ Pour tous : Flexibilité et transparence garanties. <br />
      </p>
    </Box>
  );
};

export default HomeContent;