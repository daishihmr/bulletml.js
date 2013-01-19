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

    assertTrue(true);
};

MiniTest.prototype.testQs = function() {
    function qs(array, start, end) {
        if (end < start) return;

        var left = start;
        var right = end;

        var pivot = array[start + ~~((end - start) / 2)];

        while (true) {
            while(array[left] < pivot) left++;
            while(pivot < array[right]) right--;

            if (right <= left) break;

            var tmp = array[left];
            array[left] = array[right];
            array[right] = tmp;

            left++;
            right--;
        }

        qs(array, start, left - 1);
        qs(array, right + 1, end);
    }

    var a = [ 6,3,7,2,1,3,7,9,0 ];

    qs(a, 0, a.length - 1);

    console.log("qs", a);

    assertTrue(true);
};
