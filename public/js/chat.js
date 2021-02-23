const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageForminput=$messageForm.querySelector('input')
const $messageFormbtn=$messageForm.querySelector('button')
const $sendlocationbtn=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messagetemplate=document.querySelector('#message-template').innerHTML
const locationmessagetemplate=document.querySelector('#location-message-template').innerHTML
const sidebartemplate=document.querySelector('#sidebar-template').innerHTML
//Options
const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix: true })

const autoscroll=()=>{
    //new message element
    const $newmessage=$messages.lastElementChild

    //hieght of the new message
    const newmessagestyle=getComputedStyle($newmessage) 
    const newmessagemargin=parseInt(newmessagestyle.marginBottom)
    const newmessagehieght=$newmessage.offsetHeight+newmessagemargin

    //Visible Hieght
    const visiblehieght=$messages.offsetHeight

    //hieght of messaeges container
    const containerhieght=$messages.scrollHeight

    //How far have i scrolled 
    const scrolloffest=$messages.scrollTop+visiblehieght

    if(containerhieght - newmessagehieght <= scrolloffest)
    {
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messagetemplate,{
        username:message.username,
         message:message.text,
         createdAt:moment(message.createdAt).format('hh:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})
socket.on('locationmessage',(message)=>{
    const html=Mustache.render(locationmessagetemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('hh:mm:ss a')

    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormbtn.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value
    socket.emit('sendmessage',message,(error)=>{
        $messageFormbtn.removeAttribute('disabled')
        $messageForminput.value=''
        $messageForminput.focus()
        
        if(error)
        {
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})

$sendlocationbtn.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocatio is not supprted by our browser')

    }
    $sendlocationbtn.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendlocationbtn.removeAttribute('disabled')
            console.log("Location shared!")
        })
        
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})