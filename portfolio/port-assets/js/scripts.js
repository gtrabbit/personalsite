window.onload = function(){
	makeEventListeners();
	makeScrolly();

}


const makeEventListeners = function(){


	//adds listeners to navigation
	Array.from(document.getElementsByClassName('navLink')).forEach(function(a){
		a.addEventListener('click', function(){
			smoothScroll(a.id.slice(0, -4));
		})
	})


	//listener for mailing button
	document.getElementById('contactForm').addEventListener('submit', function(e){
		e.preventDefault();
		sendMail();
	})



}


const showResponse = function(res){
	document.getElementById('response').textContent = res;

}

const sendMail = function(){
	document.getElementById('response').textContent = '';
	let name = document.getElementById('name').value;
	let email = document.getElementById('email').value;
	let msg = document.getElementById('message').value;
	let data = {
		'name': name,
		'email': email,
		'msg': msg
	}
	let request = new XMLHttpRequest();

	request.onreadystatechange = function(){
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200){
			showResponse(this.responseText);
		} 
	}

	request.open('POST', '../sendemail', true);
	request.setRequestHeader('Content-type', "application/json");
	request.send(JSON.stringify(data));

}


const smoothScroll = function(elID){
	let node = document.getElementById(elID);
	let speed = Math.ceil(node.offsetTop / 30);
	for (let i = 0; i <30; i++){

		window.setTimeout(function(){
				window.scrollBy(0, speed);
			}, i*i);
	}
	node.focus();

}


const makeScrolly = function(){
	let faders = Array.from(document.getElementsByClassName('fader'));
	let paraEls = Array.from(document.getElementsByClassName('parallax'));
	let flags = document.getElementById('flags');
	let count = 0;
	let height = window.innerHeight;
	let width = window.innerWidth;
	let speed;
	if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
		speed = 2;
	} else {
		speed = (height / width)*2;
	}
	
	window.onscroll = ()=>{
		if (count % 4 === 0){
			console.log(speed)
			faders.forEach(function(a){
	 		a.style.opacity =  1 - Math.pow( Math.abs( ( ( (window.innerHeight - (a.scrollHeight  ) )  /2) - (a.offsetTop - window.scrollY ) ) / (window.innerHeight/2)  ), 3 )
	 		})
		paraEls.forEach((el) => {
			value = (window.pageYOffset - el.offsetTop + window.innerHeight)
			let yPos = -(value / speed);
			let coords = '50% ' + yPos + 'px';
			el.style.backgroundPosition = coords;
		})
		// let colorValue = (window.pageYOffset - flags.offsetTop + window.innerHeight)/10;
		// console.log( 250-colorValue);
		// let color = "rgb(" + (250 - colorValue) + ", " + (250 - colorValue) + ", " + (250 - colorValue) + ")";
		// flags.style.backgroundColor = color;
		} else {
			count++;
		}
	

	}
	
}