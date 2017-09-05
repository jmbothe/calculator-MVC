# Calculator-MVC

#### A learning project focused on leveling-up with:
* The model/view/controller software architecture pattern.
* Principles of clean, DRY, self-documenting code.
* DOM traversal and manipulation.
* Responsive design.
* Delicious Vanilla JavaScript (DVJS).

## Table of Contents

1. [Demo](#demo)
2. [Description](#description)
3. [Highlights and Discussion](#highlights)
4. [Contributing](#contributing)
5. [Author, Credits and Links](#author)
5. [License](#license)

<a name="demo"/>

## Demo

[Try it out!](https://jmbothe.github.io/calculator-MVC/)

<a name="description"/>

## Description

This calculator was built for personal edification, and is based on two major influences. On the surface, it is an attempt to reverse engineer the basic functionality of the iOS10 calculator (in portrait view). Under the hood, it is an attempt to follow the rudiments of the MVC design pattern laid out in the vanilla JS example of the TodoMVC project.

#### How is this calculator like the basic iOS calculator?
* It follows the basic order of operations.
* It displays different subtotals based on which operator the user has selected.
* It displays numbers in an attractive and dynamic format.

#### How does this project follow the MVC design pattern?
* The calculatorMVC namespace has three properties: model, view, and controller.
* To model implements the raw functionality of the calculator.
* The view is responsible for how the calculator appears in the browser on the device.
* The controller mediates communication between the user and the model, and between the view and the model.

<a name="highlights"/>

## Highlights and Discussion

### Coding the order of operations with currying and partial application!

I imagine there are a number of ways to successfully code a set of functions that will handle the basic order of operations, but I wanted to implement something that was new and challenging, so I decided to make currying and partial application central to the functionality of the calculator's model. For those who don't know (or for those who know, but who wish to sit back and enjoy watching a newb struggle to explain succinctly), currying is a technique whereby a function that takes multiple arguments is rewritten as a series of nested functions that each take one argument. Partial application is the related technique of fixing some of the arguments of those nested functions, and returning a new function that takes just the arguments that have yet to be fixed. Currying and partial application allow this calculator to follow the order of operations by suspending the current operator and ONE of its operands within a partially applied function whenever the subsequent operator is of higher precedence. Once the higher-precedence operation is complete, its return value is passed as the final argument to the partially applied function, which then completely evaluates the pending lower-precedence expression. In addition to maintaining the order of operations, this setup also allows for the display of alternative subtotals in the event that the user consecutively selects different operators.

### Modules with private members.

I had been reading through @getify's [Scope & Closures](https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20&%20closures/README.md#you-dont-know-js-scope--closures), and of the thirty-or-so-percent that I actually understood, I was intrigued by the idea of restricting access to variables by making them private members of modules. Although this calculator is incredibly simple, and security is not really an issue, I thought it would be a great learning exercise to try to implement some modules with private members here. At the very least, including private members helped to control the side effects of code that necessarily contains quite a number of conditional paths (see below for more on conditionals). This pattern was particularly useful for coding the `expressionModule`, as I was was able to reuse it THREE TIMES!

### Separation of concerns.

This is still a new concept for me, but one thing I have come to understand is that there are different ways to approach the separation of concerns. For this project, the separation of concerns is measured by the fact that neither the model nor the view contains a reference to the other, nor to the controller. All interactions are mediated by the controller. I am aware that this is not a universally accepted standard--I imagine this sort of rigid commitment carries some of its own baggage--but as a first-time learner, it was actually the easiest way to continually monitor and stay true to the separation of concerns: if a reference shows up somewhere it doesn't belong, that means its time to rewrite!

### Being honest about conditional paths.

An important part of reducing the complexity of code (and increasing its readability/reusability/refactorability) is reducing the number of conditional paths it could potentially follow. I came face-to-face with this truth while debugging earlier implementations of the calculator's model. It is truly dizzying trying to chase bugs through a seemingly endless web of connections between different possible code states. It was a continuous struggle to manage all the paths the code was taking, and it ultimately boiled down to a concerted effort to cull the bulk of those paths. Still, although the current calculator is functional and fast, I am not entirely happy with how many conditional paths remain. But it's important to keep in mind that any code that does anything interesting will inevitably have SOME malleable state and associated conditionality to it. I simply tried my best to stick to only the essential paths, contain and restrict their side effects, and make them intelligible for readers/users.

<a name="contributing"/>

## Contributing

Your contributions are very welcome! Contact me or open an issue to discuss potential changes/additions.

<a name="author"/>

## Author and Credits

<a name="License"/>

## License

#### (The MIT License)

Copyright (c) 2014 Bill Gooch

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**[Back to top](#table-of-contents)**
