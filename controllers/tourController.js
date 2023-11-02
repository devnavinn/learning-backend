const fs = require('fs');

const dirName = `${__dirname}/../dev-data/data/tours.json`
const data = JSON.parse(fs.readFileSync(dirName));


exports.getTours = (req, res) => {
    console.log(req.requestTime)
    res.status(200).json({
        status: 'success',
        result: data.length,

        data: {
            tours: data
        }
    })
}
exports.getTour = (req, res) => {
    // eslint-disable-next-line no-console
    console.log(req.params)
    res.status(200).json({
        status: 'success',
        // result: data.length,
        // data: {
        //     tours: data
        // }
    })
}

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tour: 'updated'
        }
    })
}
exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
    })
}

exports.addTour = (req, res) => {

    const newId = data[data.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    data.push(newTour);

    fs.writeFile(
        dirName,
        JSON.stringify(data),
        err => {
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour
                }
            })
        }

    )
    res.send('successfuly done')
}