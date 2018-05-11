<?xml version="1.0" encoding="UTF-8" ?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Climate precipitation</Name>
    <UserStyle>
      <Title>Climate precipitation</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.7</Opacity>
            <ColorMap>
              <ColorMapEntry color="#ffee66" opacity="1" quantity="0"/>
              <ColorMapEntry color="#ddb833" opacity="1" quantity="10"/>
              <ColorMapEntry color="#997700" opacity="1" quantity="25"/>
              <ColorMapEntry color="#558833" opacity="1" quantity="100"/>
              <ColorMapEntry color="#229999" opacity="1" quantity="250"/>
              <ColorMapEntry color="#44aaee" opacity="1" quantity="1000"/>
              <ColorMapEntry color="#0033ff" opacity="1" quantity="2500"/>
              <ColorMapEntry color="#001166" opacity="1" quantity="10000"/>

            </ColorMap>
            </RasterSymbolizer>
          </Rule>
      </FeatureTypeStyle>
      </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
