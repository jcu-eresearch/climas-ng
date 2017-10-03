<?xml version="1.0" encoding="UTF-8" ?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Climate temperature change</Name>
    <UserStyle>
      <Title>Climate temperature change</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.75</Opacity>
            <ColorMap>

              <ColorMapEntry color="#0066dd" opacity="1" quantity="-2"/>
              <ColorMapEntry color="#55ccff" opacity="1" quantity="-1"/>
              <ColorMapEntry color="#f8f8f8" opacity="1" quantity="0"/>
              <ColorMapEntry color="#f8d899" opacity="1" quantity="1"/>
              <ColorMapEntry color="#bb8833" opacity="1" quantity="2"/>
              <ColorMapEntry color="#ff8811" opacity="1" quantity="4"/>
              <ColorMapEntry color="#ff1100" opacity="1" quantity="6"/>
              <ColorMapEntry color="#991100" opacity="1" quantity="8"/>
              <!-- <ColorMapEntry color="#cc0088" opacity="1" quantity="14"/> -->
              <!-- <ColorMapEntry color="#ff00ff" opacity="1" quantity="18"/> -->
              <ColorMapEntry color="#555555" opacity="1" quantity="14"/>
              <ColorMapEntry color="#000000" opacity="1" quantity="18"/>

            </ColorMap>
            </RasterSymbolizer>
          </Rule>
      </FeatureTypeStyle>
      </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
