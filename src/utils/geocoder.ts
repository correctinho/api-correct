const NodeGeocoder = require('node-geocoder');
const env =  require('dotenv/config')

const options = {
  provider: 'google',
  apiKey: process.env.GOOGLE_MAPS_API_KEYS, // for Mapquest, OpenCage, APlace, Google Premier
};

const geocoder = NodeGeocoder(options);

async function geocodeAddress(number: string, street: string, zipcode: string){
  try{
    const res = await geocoder.geocode({
      address: `${number} ${street}`,
      country: 'Brazil',
      zipcode: `${zipcode}`
    });

    if(res.length === 0) return {lat:"not found", long: "not found"}
    return {lat: res[0].latitude, long: res[0].longitude}
  }catch(err: any){
    console.log("Error: ", err)
  }

}

export { geocodeAddress }
