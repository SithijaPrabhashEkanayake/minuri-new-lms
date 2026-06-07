const axios = require('axios');

async function test() {
  try {
    // 2. Fetch modules to get a module ID
    const modRes = await axios.get('http://localhost:5000/api/modules');
    if (modRes.data.length === 0) {
      console.log('No modules found');
      return;
    }
    const moduleId = modRes.data[0].id;
    console.log('Module ID:', moduleId);

    // 3. PUT limit
    const putRes = await axios.put(`http://localhost:5000/api/modules/${moduleId}/limit`, {
      viewLimit: 10
    }, {
      headers: {
        'Authorization': `Bearer fake_token_for_testing`
      }
    });
    console.log('Update successful:', putRes.data);
  } catch (err) {
    console.error('Error during test:', err.response?.data || err.message);
  }
}
test();
