let result_box = document.getElementById('result_box');


let projectId = 17125;
let typeId = 1;
let email = 'bananamebot+' + Math.floor(Math.random() * 26453) + '@gmail.com';
let userId;


document.getElementById('email_form').onsubmit = function (event) {
    email = event.target.elements.email.value;
    // validate and fix email
    request('email/check', 'POST', {"email": email})
        .then(function (data) {
            email = data.email;
            let emailStatus;
            if (data.valid) {
                emailStatus = 'valid';
            } else {
                emailStatus = 'invalid';
            }
            if (data.trusted) {
                emailStatus += ' and trusted';
            } else {
                emailStatus += ' and not trusted';
            }
            writeConsole('Email status: ' + emailStatus);
        });
    return false;
};


document.getElementById('payment').onclick = function () {
    request('lastpayment', 'POST', {
        'user_id': 1240896676,
        "start_date": "1509617696",
        "expire_date": "1609617696",
        "total_count": "14",
    })
}

document.getElementById('send').onclick = function () {
    request('push/system', 'POST', {
        'type_id': typeId,
        'project_id': projectId,
        'category': 1,
        'client_id': 134933,
        'data': {
            'user': {
                'email': email,
            }
        }
    }).then(function () {
        request('user/project/' + projectId + '/email/' + email)
            .then(function (data) {
                userId = data.user.id;
                writeConsole('Sendios user ID is ' + userId)
            });
    });
}

document.getElementById('field').onclick = function () {
    request('userfields/project/' + projectId + '/email/' + email, 'POST', {
        'fruit': 'banana',
    });
}


async function request(method = '', httpMethod = 'GET', data = {}) {
    let body;
    if (httpMethod === 'POST') {
        body = JSON.stringify(data)
    }

    writeConsole('API&nbsp;' + method + '&nbsp;' + body);

    let response = await fetch('https://api-proxy.sendios.co/v1/' + method, {
        method: httpMethod,
        headers: {
            'Content-Type': 'application/json',
            'X-Proxy-Token': 'vweihmlauhwveiuamhuiven',
        },
        body
    });


    return await response.json().then(function (data) {
        return data.data;
    });
}

function writeConsole(message) {
    let console = document.getElementById("console");
    console.innerHTML += message + '<br>';
    console.scrollTop = console.scrollHeight;
}

setInterval(function () {
    fetch('https://webhook-store.sendios.co/pop/17125/YW5kcmV3QHNlbmRpb3MuaW8=')
        .then(function (response) {
            response.json().then(events => events.forEach(function (event) {
                let message = 'Webhook ' + event.event;
                if (event.mail_id !== undefined) {
                    message += ' email #' + event.mail_id;
                }
                writeConsole(message)
            }));
        })
        .catch(response => console.log(response.status));
}, 30000)
















