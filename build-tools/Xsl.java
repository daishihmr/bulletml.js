import java.io.*;
import javax.xml.transform.*;
import javax.xml.transform.stream.*;

public class Xsl {
    public static void main(String[] args) {
        try {

            StreamSource xslt = new StreamSource("build-tools/junit-noframes.xsl");
            StreamSource src = new StreamSource("target/test-report/TEST-Chrome_230127197_Windows.ParseTest.xml");
            StreamResult result = new StreamResult(new FileOutputStream("target/test-report/TEST-Chrome_230127197_Windows.ParseTest.html"));

            Transformer transformer = TransformerFactory.newInstance().newTransformer(xslt);
            transformer.transform(src, result);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

class StringUtils {
    public static String replace(String src, String a, String b) {
        if (src == null) {
            return src;
        } else {
            while (src.indexOf(a) != -1) src.replace(a, b);
            return src;
        }
    }
}
