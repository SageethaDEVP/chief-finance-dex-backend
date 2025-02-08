import axios from 'axios';

export async function secretLoader() {
  const res = await axios.get(
    `https://${process.env.DOPPLER_KEY}@api.doppler.com/v3/configs/config/secrets/download?format=json`,
  );
  process.env.PRIVATE_KEY = res.data.PRIVATE_KEY;
}
