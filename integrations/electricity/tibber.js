import request from 'superagent';
import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';

const agent = request.agent();

async function connect(requestLogin, requestWebView) {
  // TODO: implement token access request
  // const result = await requestWebView('https://developer.tibber.com/settings/accesstoken', getCallbackUrl());
  // console.log('result', result);


  const token = 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a';

  // Set state to be persisted
  return {
    token,
  };
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

function getCollectQuery(value = 100, unit = 'DAILY') {
  const graphQlRequest = `{
  viewer {
    homes {
      consumption(resolution: ${unit}, last: ${value}) {
        nodes {
          from
          to
          cost
          unitPrice
          unitPriceVAT
          consumption
          consumptionUnit
        }
      }
    }
  }
}`;
  return graphQlRequest.replace(/\n/g, '');
}

async function collect(state) {
  const query = getCollectQuery();
  const res = await agent.post('https://api.tibber.com/v1-beta/gql')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${state.token}`)
    .send({ query });

  const json = JSON.parse(res.text);
  const activities = json.data.viewer.homes[0].consumption.nodes;

  return {
    activities,
    state,
  };
}


const config = {
  contributors: ['Sh4bbY'],
  label: 'Tibber',
  country: 'SW',
  description: 'collects electricity data',
  type: ACTIVITY_TYPE_ELECTRICITY,
  isPrivate: true,
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
