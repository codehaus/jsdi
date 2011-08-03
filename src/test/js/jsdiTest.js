/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.    
 */

/*global jsdi, QUnit */

var equals = QUnit.equals;
var ok = QUnit.ok;
var raises = QUnit.raises;
var test = QUnit.test;

function B() {
    this.name = "B";
}

function A() {
    var self = this;
    //noinspection JSUnusedGlobalSymbols
    self.valueSetInConstructor = 42;
    self.b = jsdi.inject(B);
}

test("get bean by type", function() {
    var a, configuration;

    configuration = new jsdi.Configuration({
        beans : [
            {
                type : A,
                ctor : function() {
                    return new A();
                }
            },
            {
                type : B,
                ctor : function() {
                    return new B();
                }
            }
        ]
    });

    a = configuration.getBean(A);

    ok(a.b.name === "B");
});

test("get bean by id", function() {
    var configuration, x, y;

    configuration = new jsdi.Configuration({
        beans : [
            {
                id : "x",
                ctor : function() {
                    return {
                        id : "x"
                    };
                }
            },
            {
                id : "y",
                ctor : function() {
                    return {
                        x : jsdi.resource("x")
                    };
                }
            }
        ]
    });

    y = configuration.getBean("y");

    equals("x", y.x.id);
});

test("prototype scope", function() {
    var configuration, a, x;

    configuration = new jsdi.Configuration({
        beans : [
            {
                type : B,
                scope : jsdi.PROTOTYPE,
                ctor : function() {
                    return new B();
                }
            },
            {
                id : "x",
                ctor : function() {
                    var self = {};
                    self.b = jsdi.inject(B);
                    return self;
                }
            },
            {
                type : A,
                ctor : function() {
                    return new A();
                }
            }
        ]
    });
    x = configuration.getBean("x");
    a = configuration.getBean(A);
    ok(a.b);
    ok(x.b);
    ok(a.b !== x.b);
});

test("inject requires function", function() {
    raises(function() {
        jsdi.inject(42);
    });
});

test("requires string id", function() {
    raises(function() {
        jsdi.resource(42);
    });
});

test("resolve", function() {
    var a, c;

    a = {
        b : jsdi.inject(B),
        d : {
            id : "rubbish",
            value : "some value"
        }
    };

    c = new jsdi.Configuration({
        beans : [
            {
                type : B,
                ctor : function() {
                    return new B();
                }
            }
        ]
    });

    equals(a.b.name, undefined);

    c.resolve(a);

    equals(a.b.name, "B");
    equals(a.d.value, "some value");
});

test("resolve accepts scope with null value", function() {
    var scope, configuration;

    scope = {
        nullBean: null,
        notNullBean: jsdi.inject(B)
    };

    configuration = new jsdi.Configuration({
        beans: [
            {
                type: B,
                ctor: function() {
                    return new B();
                }
            }
        ]
    });

    configuration.resolve(scope);

    ok(scope.nullBean === null);
    ok(scope.notNullBean instanceof B);
});
