import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BOARD) #read the pin as board instead of BCM pin


LinearActuatorDir = 12
LinearActuatorStepPin = 11

GPIO.setwarnings(False)
GPIO.setup(LinearActuatorDir, GPIO.OUT)
GPIO.setup(LinearActuatorStepPin, GPIO.OUT)

FastSpeed = 0.00045 #Change this depends on your stepper motor
LowSpeed = 0.00045


print ("Move Forward")
for i in range (5*900):
    GPIO.output(LinearActuatorDir, GPIO.HIGH)
    GPIO.output(LinearActuatorStepPin, GPIO.HIGH)
    time.sleep(FastSpeed)
    GPIO.output(LinearActuatorStepPin, GPIO.LOW)
    time.sleep(FastSpeed)
