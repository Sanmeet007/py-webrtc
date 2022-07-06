from pprint import pprint
from flask import Flask, render_template, render_template_string
from flask_socketio import SocketIO

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app)


@app.route("/")
def homePage():
    return render_template("index.jinja")


@socketio.on("offer")
def on_offer(offer):
    print("someone offered a call")
    socketio.emit("offer", offer, broadcast=True, include_self=False)


@socketio.on("answer")
def on_answer(answer):
    print("someone answered a call")
    socketio.emit("answer", answer, broadcast=True, include_self=False)


@socketio.on("candidate")
def on_candidate(candidate):
    socketio.emit("candidate", candidate, broadcast=True, include_self=False)


if __name__ == "__main__":
    socketio.run(app, debug=True, port=5500)
