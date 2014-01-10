(function(global, undef) {
	$(function() {

		function objtoarr(obj) {
			var ret = [];
			for (var i in obj) {
				ret.push(obj[i]);
			}
			return ret;
		}

		window.snake = new Snake;

		snake.config({
			containerId: 'hehe'
		});

		var serverid;

		snake.init();

		var socket = io.connect('http://172.16.121.205:5566');
		//初始化房间信息- 剔除server id
		socket.on('open', function(data) {
			//console.log(data.roomstatus);
			//console.log(data.id + ' is in the room');
			serverid = data.id;
			socket.emit('serverinit', serverid);
			socket.emit('reopen');
			$('#number').text('当前房间人数0');
			var ret = '';
			var roomstatus = data.roomstatus;
			for (var i in roomstatus) {
				ret += i + ':' + (roomstatus[i].isready ? '已准备': '未准备') + '<br>';
			}
			$('#userstatus').html(ret);
		});

		snake.bind('died', 'room',function(data) {
           socket.emit('died',data.name);  
        });

        snake.bind('gameover','room',function(data){
           socket.emit('gameover');  
           location.reload();
        });

		socket.on('system', function(json) {
			if (json.type == 'new') {
				socket.emit('status', function(data) {
					var users = [];
					for (var i in data) {
						var user = data[i];
						users.push({
							name: user.id
						});
					}
					snake.addPlayers(users);
				});
				$('#number').text('当前房间人数' + objtoarr(json.data).length);
				var ret = '';
				var roomstatus = json.data;
				for (var i in roomstatus) {
					ret += i + ':' + (roomstatus[i].isready ? '已准备': '未准备') + '<br>';
				}
				$('#userstatus').html(ret);
			}
			if (json.type === 'allready') {
				var s = 5;
				$('#status').text('还有' + s + '秒,游戏即将开始');
				var T = setInterval(function() {
					s--;
					$('#status').text('还有' + s + '秒,游戏即将开始');
					if (s === 0) {
						clearInterval(T);
						snake.run();
					}
				},
				1000);
			}
			if (json.type === 'disconnect') {
				//判断全离线 初始化
				console.log('id ' + json.data.id + ' is out');
                snake.removePlayer(json.data.id);
                console.log(json.data.roomstatus);
				$('#number').text('当前房间人数' + objtoarr(json.data.roomstatus).length);
				//如果一个用户掉了，要remove掉蛇实例
			}
			if (json.type == 'top') {
				snake.setDirection(snake.players[json.data.id].snake, 'up');
			}
			if (json.type == 'right') {
				snake.setDirection(snake.players[json.data.id].snake, 'right');
			}
			if (json.type == 'down') {
				snake.setDirection(snake.players[json.data.id].snake, 'down');
			}
			if (json.type == 'left') {
				snake.setDirection(snake.players[json.data.id].snake, 'left');
			}
		});
	});
})(this);

