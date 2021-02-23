const users=[]

//add user,removeuser, getuser, getusersinroom

const adduser=({id,username,room})=>{
    //clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //Validate the data
    if(!username || !room)
    {
        return {
            error:'Username and room are Required'
        }
    }

   //Cheak for Existing user
   const existinguser=users.find((user)=>{
       return user.room===room && user.username===username
   }) 

   //Validate username
   if(existinguser)
   {
       return{
           error:'Username already exists!'
       }
   }

   //Store user
   const user={id,username,room}
   users.push(user)
   return {user}

}

const removeuser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)
    if(index !==-1)
    {
        return users.splice(index,1)[0]
    }
}

const getuser=(id)=>{
    return users.find((user)=>user.id===id)
    
}

const getusersinroom=(room)=>{
    return users.filter((user)=>user.room===room)
    

}

module.exports={
    adduser,
    removeuser,
    getuser,
    getusersinroom
}
