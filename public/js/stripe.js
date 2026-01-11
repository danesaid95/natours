/*eslint-disable */
import axios from 'axios';

const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

export const bookTour = async (tourId) => {
  //1) retrieve checkout session
  try {
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3008/api/v1/bookings/checkout-session/${tourId}`,
      data: null,
    });
    const url = res.data.session.url;
    location.assign(url);
  } catch (err) {
    console.log(err);
  }
};
