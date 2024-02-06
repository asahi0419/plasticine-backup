export const GridBaseTemplate = 
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
        {grid_cols}
    </w:tblGrid>
    {header_row}
    {body_rows}
</w:tbl>` 

export const GridNoRecords =
    `<w:p>
        <w:pPr>
            <w:jc w:val="center" />
            <w:rPr>
                <w:rFonts w:hint="default" />
                <w:lang w:val="en-US" />
            </w:rPr>
        </w:pPr>
        <w:r>
            <w:rPr>
                <w:rFonts w:hint="default" />
                <w:lang w:val="en-US" />
            </w:rPr>
            <w:t>No records</w:t>
        </w:r>
        <w:bookmarkStart w:id="0" w:name="_GoBack" />
        <w:bookmarkEnd w:id="0" />
        <w:r>
            <w:rPr>
                <w:rFonts w:hint="default" />
                <w:lang w:val="en-US" />
            </w:rPr>
            <w:t xml:space="preserve"> to display</w:t>
        </w:r>
    </w:p>`