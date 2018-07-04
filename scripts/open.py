from rrb3 import *
from random import randint

rr = RRB3(12, 12) # Battery voltage 12V, motor 12V

T = 22  # 20 seconds to extend

try:
    print("extending")
    rr.reverse(T, 1.0)
    print("done")
finally:
	rr.cleanup() # Set all GPIO pins to safe input state