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
  document.querySelector('#emails-view').innerHTML = `<h3 id=\"mail_name"\>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // To make api request for mails in respective category
  fetch(`/emails/${mailbox}`)
  .then(response=> response.json())
  .then( emails=>{
    console.log(emails);
    for(let i=0;i<=emails.length-1;i++)
    {
      const element= document.createElement('div');
      element.innerHTML=`<strong>${emails[i].sender}</strong> &nbsp; &nbsp; ${emails[i].subject} &nbsp;<br><small> ${emails[i].timestamp}</small>`;
      element.className="emails";
      if (emails[i].read === true || mailbox === 'sent')
      {
        element.style.background = '#ddd';
      }
      element.addEventListener('click',function(){
        open_message(emails[i].id,mailbox);
      });
      document.querySelector('#emails-view').append(element);
    }
  })
}

function send_mail(){
  //Taking inputs
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

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

function open_message(id,mailbox)
{
  document.querySelector('#emails-view').style.display='none';
  document.querySelector('#compose-view').style.display='none';
  document.querySelector('#message-view').style.display='block';
  
  if(mailbox === "inbox" || mailbox === "archive")
  {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read : true
      })
    })
  }

  fetch(`/emails/${id}`)
  .then(response=>response.json())
  .then(email=>{
    document.querySelector('#message-view').innerHTML="";
    let templateScript= Handlebars.compile(" <strong>From:</strong><div> {{sender}}</div> <strong>To:&emsp;</strong><div> {{recipients}}</div><div><strong>subject:&emsp;</strong>{{subject}}</div><div><strong>Sent on:&emsp;</strong>{{timestamp}}</div><div id=\"message_body\">{{body}}</div><br> ");
    let info = {"sender":email.sender, "recipients":email.recipients, "subject":email.subject, "timestamp":email.timestamp, "body":email.body};
    document.querySelector('#message-view').innerHTML=templateScript(info);


    // Arcive/Unarchive button creation
    if(mailbox === "inbox" || mailbox === "archive")
    {
      var archive=document.createElement('button');
      archive.style.border="1px solid black";
      archive.className = "archive";

      if (email.archived === false){
        archive.innerHTML = "archive";
        archive.addEventListener('click',()=>{archive_mail(email.id)});
      }
      else{
        archive.innerHTML = "unarchive";
        archive.addEventListener('click',()=>{unarchive_mail(email.id)});
      }

      document.querySelector('#message-view').append(archive,"  ");

      const mark = document.createElement('button');
      mark.style.border="1px solid black";
      mark.innerHTML = "Mark as Unread";
      mark.className = "mark";
      mark.addEventListener('click',()=>{mark_unread(email.id)});
      document.querySelector('#message-view').append(mark);
    }

    // Reply button
    const reply = document.createElement('button');
    reply.style.border="1px solid black";
    reply.innerHTML = "reply";
    reply.className = "reply";
    reply.addEventListener('click',()=>{msg_reply(email.sender,email.subject,email.timestamp,email.body)});
    document.querySelector('#message-view').append(reply);

  })
}

//To archive a message

function archive_mail(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  setTimeout(()=>load_mailbox('inbox'),600);  //To display inbox after a certain Interval
}

function unarchive_mail(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  setTimeout(()=>load_mailbox('inbox'),600);  //To display inbox after a certain Interval
}

function msg_reply(sender,subject,date,body){
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = sender;
  if(subject.includes('Re:'))
  {
    document.querySelector('#compose-subject').value = subject;
  }
  else
  {
    document.querySelector('#compose-subject').value = 'Re: '+subject;
  }
  document.querySelector('#compose-body').value = `On ${date} ${sender} wrote: ${body}`;
}

function mark_read(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read : true
    })
  })
}

function mark_unread(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read : false
    })
  })
  setTimeout(()=>load_mailbox('inbox'),600);  //To display inbox after a certain Interval
}