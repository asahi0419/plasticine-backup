export const TabXmlTemplate = `
<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="00000002">
    <w:pPr>
        <w:shd w:fill="f3f4f5" w:val="clear"/>
        <w:spacing w:after="48" w:before="48" w:line="240" w:lineRule="auto"/>
        <w:jc w:val="left"/>
    </w:pPr>
    <w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000">
        <w:t xml:space="preserve">{name}</w:t>
    </w:r>
</w:p>
`

export const SectionXmlTemplate = `
<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="00000002">
    <w:pPr>
        <w:keepNext w:val="0"/>
        <w:keepLines w:val="0"/>
        <w:pageBreakBefore w:val="0"/>
        <w:widowControl w:val="0"/>
        <w:pBdr>
            <w:top w:space="0" w:sz="0" w:val="nil"/>
            <w:left w:space="0" w:sz="0" w:val="nil"/>
            <w:bottom w:space="0" w:sz="0" w:val="nil"/>
            <w:right w:space="0" w:sz="0" w:val="nil"/>
            <w:between w:space="0" w:sz="0" w:val="nil"/>
        </w:pBdr>
        <w:spacing w:after="48" w:before="48" w:line="240" w:lineRule="auto"/>
        <w:ind w:left="0" w:right="0" w:firstLine="0"/>
        <w:jc w:val="{align}"/>
        <w:shd w:fill="{background_color}" w:val="clear"/>
        <w:rPr>
            <w:rFonts w:ascii="Microsoft Sans Serif" w:cs="Microsoft Sans Serif" w:eastAsia="Microsoft Sans Serif" w:hAnsi="Microsoft Sans Serif"/>
            <w:b w:val="1"/>
            <w:i w:val="0"/>
            <w:smallCaps w:val="0"/>
            <w:strike w:val="0"/>
            <w:sz w:val="20"/>
            <w:szCs w:val="20"/>
            <w:u w:val="none"/>
            <w:vertAlign w:val="baseline"/>
        </w:rPr>
    </w:pPr>
    <w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000">
        <w:rPr>
            <w:rFonts w:ascii="Microsoft Sans Serif" w:cs="Microsoft Sans Serif" w:eastAsia="Microsoft Sans Serif" w:hAnsi="Microsoft Sans Serif"/>
            <w:b w:val="1"/>
            <w:i w:val="0"/>
            <w:smallCaps w:val="0"/>
            <w:strike w:val="0"/>
            <w:sz w:val="20"/>
            <w:szCs w:val="20"/>
            <w:u w:val="none"/>
            <w:vertAlign w:val="baseline"/>
            <w:rtl w:val="0"/>
            <w:color w:val="{text_color}"/>
        </w:rPr>
        <w:t xml:space="preserve">{name}</w:t>
    </w:r>
</w:p>
`

export const SectionContentXmlTemplate = 
`<w:tbl>
    <w:tblPr>
        <w:jc w:val="center" />
        <w:tblW w:w="0" w:type="auto" />
        <w:tblInd w:w="-120" w:type="dxa" />
        <w:tblBorders>
            <w:top w:val="single" w:color="000000" w:sz="4" w:space="0" />
            <w:left w:val="single" w:color="000000" w:sz="4" w:space="0" />
            <w:bottom w:val="single" w:color="000000" w:sz="4" w:space="0" />
            <w:right w:val="single" w:color="000000" w:sz="4" w:space="0" />
            <w:insideH w:val="single" w:color="000000" w:sz="4" w:space="0" />
            <w:insideV w:val="single" w:color="000000" w:sz="4" w:space="0" />
        </w:tblBorders>
        <w:tblLayout w:type="autofit" />
        <w:tblCellMar>
            <w:top w:w="15" w:type="dxa" />
            <w:left w:w="15" w:type="dxa" />
            <w:bottom w:w="15" w:type="dxa" />
            <w:right w:w="15" w:type="dxa" />
        </w:tblCellMar>
    </w:tblPr>
    <w:tblGrid>
        {section_cols}
    </w:tblGrid>
    {section_rows}
</w:tbl>` 

export const DefaultFormTemplate = 
`<w:tbl>
    <w:tblPr>
        <w:jc w:val="center" />
        <w:tblW w:w="0" w:type="auto" />
        <w:tblInd w:w="-120" w:type="dxa" />
        <w:tblBorders>
            <w:top w:val="single" w:color="b4c7dc" w:sz="4" w:space="0" />
            <w:left w:val="single" w:color="b4c7dc" w:sz="4" w:space="0" />
            <w:bottom w:val="single" w:color="b4c7dc" w:sz="4" w:space="0" />
            <w:right w:val="single" w:color="b4c7dc" w:sz="4" w:space="0" />
            <w:insideH w:val="single" w:color="b4c7dc" w:sz="4" w:space="0" />
            <w:insideV w:val="single" w:color="b4c7dc" w:sz="4" w:space="0" />
        </w:tblBorders>
        <w:shd w:val="clear" />
        <w:tblLayout w:type="autofit" />
        <w:tblCellMar>
            <w:top w:w="15" w:type="dxa" />
            <w:left w:w="15" w:type="dxa" />
            <w:bottom w:w="15" w:type="dxa" />
            <w:right w:w="15" w:type="dxa" />
        </w:tblCellMar>
    </w:tblPr>
    <w:tblGrid>
        <w:gridCol />
        <w:gridCol />
    </w:tblGrid>
    {body_rows}
</w:tbl>`

export const ImagePlaceholderTemplate = `
<w:p>
    <w:pPr>
        <w:ind w:left="0" w:right="0" w:firstLine="0" />
    </w:pPr>
    <w:r>
        <w:rPr>
            <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial" />
            <w:sz w:val="20" />
            <w:szCs w:val="20" />
            <w:rtl w:val="0" />
        </w:rPr>
        <w:t>
            {placeholderName}
        </w:t>
    </w:r>
</w:p>
`