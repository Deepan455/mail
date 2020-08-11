document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit').addEventListener('click', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // To make api request for mails in respective category
  fetch(`/emails/${mailbox}`)
  .then(response=> response.json())
  .then( emails=>{
    console.log(emails);
    for(let i=0;i<=emails.length-1;i++)
    {
      const element= document.createElement('div');
      element.style.border="1px solid black";
      element.innerHTML=`${emails[i].sender} &nbsp; ${emails[i].subject} &nbsp; ${emails[i].timestamp}`;
      element.className="emails";
      element.addEventListener('click',function(){
        open_message(emails[i].id);
      });
      document.querySelector('#emails-view').append(element);
    }
  })
}

function send_mail(){
  //Taking inputs
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-subject').value;

  // To make api request
  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    if(result.error != undefined)
    { 
      alert(result.error);
    }
    if(result.message != undefined){
      alert(result.message);
      load_mailbox('sent');
    }
  })

  return false;
}

function open_message(id)
{
  document.querySelector('#emails-view').style.display='none';
  document.querySelector('#compose-view').style.display='none';
  document.querySelector('#message-view').style.display='block';
  

  fetch(`/emails/${id}`)
  .then(response=>response.json())
  .then(email=>{
    let templateScript= Handlebars.compile(" Sender: {{sender}} <br> Recipients: {{recipients}} <br> subject: {{subject}} <br> {{timestamp}} <br> Content <br> {{body}} <br> <br>");
    let info = {"sender":email.sender, "recipients":email.recipients, "subject":email.subject, "timestamp":email.timestamp, "body":email.body};
    document.querySelector('#message-view').innerHTML= templateScript(info);


    let archive=document.createElement('button');
    archive.innerHTML = "archive";
    archive.className = "archive";

    let reply = document.createElement('button');
    reply.innerHTML = "reply";
    reply.className = "reply";
    reply.addEventListener('keyup',archive_mail(email.id));

    document.querySelector('#message-view').append(reply)
  })
}

//To archive a message

function archive_mail(id){
  alert(id);  
}