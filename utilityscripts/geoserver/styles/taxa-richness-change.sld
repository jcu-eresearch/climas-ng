<?xml version="1.0" encoding="UTF-8" ?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>Taxa richness change</Name>
    <UserStyle>
      <Title>Taxa Richness Change</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.7</Opacity>
            <ColorMap>

              <ColorMapEntry color="#bb0000" opacity="1" quantity="0.00"/>
              <ColorMapEntry color="#eecc99" opacity="1" quantity="0.25"/>
              <ColorMapEntry color="#bb7700" opacity="1" quantity="0.475"/>
              <ColorMapEntry color="#99ff33" opacity="1" quantity="0.525"/>
              <ColorMapEntry color="#66cc18" opacity="1" quantity="0.75"/>
              <ColorMapEntry color="#003300" opacity="1" quantity="1.00"/>
              <ColorMapEntry color="#002299" opacity="1" quantity="10.00"/>

            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
      </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
