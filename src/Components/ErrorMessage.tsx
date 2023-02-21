export default function ErrorMessage({message}:any) {
  if (!message) return null;

    return (
      <div className="red  mt-1 word">
        <div className="flex-1">
          
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            ></path>
          

          <label>{message}</label>
        </div>
      </div>
    );


}


