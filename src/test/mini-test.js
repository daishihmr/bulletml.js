var MiniTest = TestCase("MiniTest");

MiniTest.prototype.test1 = function() {
    var xml = "<a><b>B</b><c/><d>C</d></a>";

    var domParser = new DOMParser();
    var dom = domParser.parseFromString(xml, "application/xml");
    var a = dom.getElementsByTagName("a")[0];
    var c = a.getElementsByTagName("c")[0];

    var children = c.childNodes;
    for (var i = 0, end = children.length; i < end; i++) {
        console.log(children[i]);
    }


};
