const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);


describe('/scan route', () => {
  it('should receive and image URL and respond with JSON object describing the result', (done) => {
    chai.request(app).post('/scan').type('form').send({image_url: "https://scontent.xx.fbcdn.net/v/t1.0-9/p720x720/14925417_132991980507291_6747420405987458755_n.jpg?oh=e58db640a668385c6cecbfe68f50ffcd&oe=58D1BF38"})
      .end( (err, res) => {
        // console.log(res);
        // console.log(err);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        done();
      })
  })
})
