var mongo = require('mongodb');
var _ = require('lodash');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:melissa97@cluster0-keuj1.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";
const client = new MongoClient(uri, {
	useNewUrlParser: true
});
client.connect(err => {
	const collection = client.db("DB1").collection("covid_19");
	// perform actions on the collection object

	collection.find({
			keyId: {
				$regex: '.*Lake, Illinois*.',
				$options: ''
			}
		})
        .toArray()
		.then((docs) => {
			console.log(`${docs.length} documents match the specified query.`);
            _.each(docs, function(item){
                console.log(item);
            })
		})
		.catch(err => console.log("Failed to count documents: ", err))

	client.close();
	console.log('after clode');
});

// request("https://www.google.com", function(err, response, body) {
// 	if (err) {
// 		console.log('got a web error');
// 	} else {
// 		console.log('got some web data');
// 	}
// });